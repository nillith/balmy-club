import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {isValidPostContent, isValidStringId, isValidTimestamp, utcTimestamp} from "../../../shared/utils";
import {Activity, isValidPostVisibility, PostVisibilities} from "../../../shared/interf";
import {MAX_VISIBLE_CIRCLE_NUMBER, POSTS_GROUP_SIZE} from "../../../shared/constants";
import {isString} from "util";
import {PostModel} from "../../models/post.model";
import {$user} from "../../constants/symbols";
import db from "../../persistence/index";
import {ActivityModel} from "../../models/activity.model";
import {NotificationModel} from "../../models/notification.model";
import _ from 'lodash';
import {CommentModel} from "../../models/comment.model";
import {INVALID_NUMERIC_ID, postObfuscator} from "../../service/obfuscator.service";
import {respondWithJson} from "../../init";

// authorId?: number | string;
// [$authorId]?: string;
// reShareFromPostId?: number | string;
// [$reShareFromPostId]?: string;
// visibility?: PostVisibilities;
// [$authorId]?: string;
// content?: string;

const filterShareCircleIds = function(circleIds: any) {
  const result: any[] = [];
  if (circleIds && circleIds.length) {
    const end = Math.max(MAX_VISIBLE_CIRCLE_NUMBER, circleIds.length);
    let id;
    for (let i = 0; i < end; ++i) {
      id = circleIds[i];
      if (isValidStringId(id)) {
        result.push(id);
      }
    }
  }
  return result;
};


const getNewPostPayloadOrErr = function(body: any) {
  let {reShareFromPostId, visibility, content, visibleCircleIds} = body;
  content = String(content || '').trim();
  if (reShareFromPostId) {
    if (!isValidStringId(reShareFromPostId)) {
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

  if (visibility !== PostVisibilities.Private) {
    visibleCircleIds = undefined;
  } else {
    visibleCircleIds = filterShareCircleIds(visibleCircleIds);
  }

  return {reShareFromPostId, visibility, content, visibleCircleIds};
};


export const publishNewPost = async function(req: Request, res: Response, next: NextFunction) {
  const {body} = req;

  const data = getNewPostPayloadOrErr(body);
  if (isString(data)) {
    return respondWith(res, 400, data);
  }

  const post = PostModel.unObfuscateFrom(data);
  if (!post) {
    return respondWith(res, 400);
  }

  const user = req[$user];
  if (!user) {
    return respondWith(res, 401);
  }

  const timestamp = utcTimestamp();
  post.authorId = user.id;
  post.createdAt = timestamp;

  let mentions = post.extractMentionsFromContent();
  if (!_.isEmpty(mentions)) {
    mentions = await post.sanitizeContentMentions(mentions);
  }
  post.mentionIds = mentions.map((m) => m.id);
  const subscriberIds = await user.getSubscriberIds();

  await db.inTransaction(async (connection) => {
    await post.insertIntoDatabase(connection);
    const activity = new ActivityModel(user.id, post.id as number, Activity.ObjectTypes.Post, Activity.ContentActions.Create, timestamp);
    await activity.insertIntoDatabase(connection);
    if (subscriberIds && subscriberIds.length) {
      await NotificationModel.bulkInsertIntoDatabase(connection, subscriberIds, activity.id as number, timestamp);
    }
    if (!_.isEmpty(mentions)) {
      await (Promise as any).map(mentions, async (m) => {
        const mentionActivity = new ActivityModel(user.id, m.id, Activity.ObjectTypes.User, Activity.UserActions.Mention, timestamp, post.id as number, Activity.ContextTypes.Post);
        await mentionActivity.insertIntoDatabase(connection);
        const notification = new NotificationModel(m.id as number, mentionActivity.id as number, timestamp);
        await notification.insertIntoDatabase(connection);
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
    return respondWith(res, 404);
  }

  const viewer = req[$user];
  const params = {
    timestamp,
    offset: group * POSTS_GROUP_SIZE,
    viewerId: viewer.id,
  };

  let posts = await PostModel.getPublicTimelinePosts(params);

  if (!posts.length) {
    return respondWith(res, 200);
  }

  for (const p of posts) {
    p.comments = await CommentModel.getCommentsByPostId(p.id as number, viewer.id);
  }

  posts = posts.map((p) => {
    if (p.comments) {
      p.comments = p.comments.map((c) => {
        return c.getOutboundData();
      });
    }
    return p.getOutboundData();
  });
  respondWith(res, 200, JSON.stringify(posts));
};

export const getPostById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const viewer = req[$user];
    const post = await PostModel.getPostById(postId, viewer.id);
    if (post) {
      post.comments = await CommentModel.getCommentsByPostId(postId, viewer.id);
      post.comments = post.comments.map(c => c.getOutboundData());
      respondWithJson(res, post);
    }
  }
  return respondWith(res, 404);
};
