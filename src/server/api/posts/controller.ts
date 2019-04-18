import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {isValidPostContent, isValidStringId, isValidTimestamp, utcTimestamp} from "../../../shared/utils";
import {Activity, isValidPostVisibility, PostVisibilities} from "../../../shared/interf";
import {MAX_VISIBLE_CIRCLE_NUMBER, POSTS_GROUP_SIZE} from "../../../shared/constants";
import {PostBuilder, PostModel, PostViewer, PublishPostData} from "../../models/post.model";
import db from "../../persistence/index";
import {$id, circleObfuscator, INVALID_NUMERIC_ID, postObfuscator} from "../../service/obfuscator.service";
import {ActivityModel, RawActivity} from "../../models/activity.model";
import {BroadcastParams, NotificationModel, RawNotification} from "../../models/notification.model";
import {CommentModel} from "../../models/comment.model";
import {getRequestUser} from "../../service/auth.service";
import {isString} from "util";
import {PublishPostRequest} from "../../../shared/contracts";
import _ from 'lodash';

const filterShareCircleIds = function(circleIds: any): number[] {
  const result: number[] = [];
  if (circleIds && circleIds.length) {
    const end = Math.max(MAX_VISIBLE_CIRCLE_NUMBER, circleIds.length);
    let id;
    for (let i = 0; i < end; ++i) {
      id = circleIds[i];
      if (isValidStringId(id)) {
        const circleId: number = circleObfuscator.unObfuscate(id);
        if (INVALID_NUMERIC_ID !== circleId) {
          result.push(circleId);
        }
      }
    }
  }
  return result;
};

const getNewPostPayloadOrErr = function(body: PublishPostRequest): PublishPostData | string {
  let {reShareFromPostId, visibility, content, visibleCircleIds} = body;
  let reShareId: number | undefined;
  content = String(content || '').trim();
  if (reShareFromPostId) {
    if (!isValidStringId(reShareFromPostId) || INVALID_NUMERIC_ID === (reShareId = postObfuscator.unObfuscate(reShareFromPostId))) {
      return `invalid reshare post id`;
    }
  }

  if (!content && !reShareFromPostId) {
    return `no post content`;
  } else if (!isValidPostContent(content)) {
    return `invalid content length`;
  }

  if (!visibility && visibleCircleIds && visibleCircleIds.length) {
    visibility = PostVisibilities.Private;
  }

  if (!isValidPostVisibility(visibility)) {
    return `invalid post visibility!`;
  }

  let unObfuscatedCircleIds: number[] | undefined;

  if (visibility === PostVisibilities.Private) {
    unObfuscatedCircleIds = filterShareCircleIds(visibleCircleIds);
  }

  return {
    reShareFromPostId: reShareId,
    visibility,
    content,
    visibleCircleIds: unObfuscatedCircleIds
  };
};


export const publishNewPost = async function(req: Request, res: Response, next: NextFunction) {
  const {body} = req;

  const data = getNewPostPayloadOrErr(body);
  if (isString(data)) {
    return respondWith(res, 400, data);
  }

  const timestamp = utcTimestamp();
  const author = getRequestUser(req);
  const postBuilder = new PostBuilder(author, data, timestamp);
  const [mentions, rawPost] = await postBuilder.build();
  const subscriberIds = await author.getSubscriberIds();

  await db.inTransaction(async (connection) => {
    const postId = await PostModel.insert(rawPost, connection);

    const rawPostActivity = {
      subjectId: author[$id],
      objectId: postId,
      objectType: Activity.ObjectTypes.Post,
      actionType: Activity.ContentActions.Create,
      timestamp,
    };
    const postActivityId = await ActivityModel.insert(rawPostActivity, connection);
    if (subscriberIds && subscriberIds.length) {

      const params: BroadcastParams = {
        recipientIds: subscriberIds,
        activityId: postActivityId,
        timestamp,
      };
      await NotificationModel.broadcastInsert(params, connection);
    }
    if (!_.isEmpty(mentions)) {
      await (Promise as any).map(mentions, async (m) => {
        const rawMentionActivity = {
          subjectId: author[$id],
          objectId: m.id,
          objectType: Activity.ObjectTypes.User,
          actionType: Activity.UserActions.Mention,
          timestamp,
          contextId: postId,
          contextType: Activity.ContextTypes.Post
        };
        const mentionActivityId = await ActivityModel.insert(rawMentionActivity, connection);
        const rawNotification: RawNotification = {
          recipientId: m.id,
          activityId: mentionActivityId,
          timestamp,
        };
        await NotificationModel.insert(rawNotification, connection);
      });
    }
  });
  respondWith(res, 200);
};


export const getPublicStreamPosts = async function(req: Request, res: Response, next: NextFunction) {
  const {query} = req;
  const timestamp = Math.floor(parseFloat(query.t));
  const group = Math.floor(parseFloat(query.g));

  if (!isValidTimestamp(timestamp) || group < 0) {
    console.log(`${isValidTimestamp(timestamp)}:${group}`);
    return respondWith(res, 404);
  }

  const observer = getRequestUser(req);
  const params = {
    timestamp,
    offset: group * POSTS_GROUP_SIZE,
    observerId: observer[$id],
  };

  let posts = await PostModel.getPublicTimelinePosts(params);

  if (!posts.length) {
    return respondWith(res, 200);
  }

  for (const p of posts) {
    p.comments = await CommentModel.getCommentsForPost({
      postId: p[$id],
      observerId: observer[$id]
    });
    console.log(p.comments);
  }
  respondWith(res, 200, JSON.stringify(posts));
};

export const getPostById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  // const postId = postObfuscator.unObfuscate(id);
  // if (INVALID_NUMERIC_ID !== postId) {
  //   const viewer = req[$user];
  //   const postViewer = {
  //     postId,
  //     observerId: observer[$id]
  //   };
  //   const post = await PostModel.getPostById(postViewer);
  //   if (post) {
  //     post.comments = await CommentModel.getCommentsForPost(postViewer);
  //     post.comments = post.comments.map(c => c.getOutboundData());
  //     return respondWithJson(res, post);
  //   }
  // }
  return respondWith(res, 404);
};

export const plusPost = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const observer = getRequestUser(req);
    const postViewer: PostViewer = {
      postId, observerId: observer[$id]
    };
    if (await PostModel.isAccessible(postViewer)) {
      const timestamp = utcTimestamp();
      await db.inTransaction(async (conn) => {
        await conn.query('INSERT INTO PostPlusOnes (postId, userId) VALUES (:postId, :observerId)', postViewer);

        const rawActivity = {
          subjectId: observer[$id],
          objectId: postId,
          objectType: Activity.ObjectTypes.Post,
          actionType: Activity.ContentActions.PlusOne,
          timestamp,
        };
        const activityId = await ActivityModel.insert(rawActivity as RawActivity, conn);
        const rawNotification: RawNotification = {
          recipientId: observer[$id],
          activityId,
          timestamp,
        };
        await NotificationModel.insert(rawNotification, conn);
        await conn.query('UPDATE Posts SET plusCount = plusCount + 1 WHERE id = :postId', postViewer);
      });
      return respondWith(res, 200);
    }
  }
  return respondWith(res, 404);
};

export const unPlusPost = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const observer = getRequestUser(req);
    const postViewer: PostViewer = {
      postId, observerId: observer[$id]
    };
    if (await PostModel.isAccessible(postViewer)) {
      await db.inTransaction(async (conn) => {
        const [result] = await conn.query('DELETE FROM PostPlusOnes WHERE postId = :postId AND userId = :observerId', postViewer);
        if (!result || 1 !== (result as any).affectedRows) {
          throw Error('No plus one to delete!');
        }
        await conn.query('UPDATE Posts SET plusCount = plusCount - 1 WHERE id = :postId', postViewer);
      });
      return respondWith(res, 200);
    }
  }
  return respondWith(res, 404);
};
