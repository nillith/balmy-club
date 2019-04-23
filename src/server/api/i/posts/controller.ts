import {NextFunction, Request, Response} from "express";
import {PostBuilder, PostModel, PublishPostData} from "../../../models/post.model";
import {PublishPostRequest} from "../../../../shared/contracts";
import {MAX_VISIBLE_CIRCLE_NUMBER} from "../../../../shared/constants";
import {isValidPostContent, isValidStringId, utcTimestamp} from "../../../../shared/utils";
import {
  $id,
  $mentionIds,
  circleObfuscator,
  INVALID_NUMERIC_ID,
  postObfuscator
} from "../../../service/obfuscator.service";
import {Activity, isValidPostVisibility, PostVisibilities} from "../../../../shared/interf";
import {respondWith} from "../../../utils/index";
import {isString} from "util";
import {getRequestUser} from "../../../service/auth.service";
import {messengerService, RawAlikeNotifications} from "../../../service/messenger.service";
import db from "../../../persistence/index";
import {ActivityModel, RawMentionActivities} from "../../../models/activity.model";
import {BroadcastParams, NotificationModel, RawBulkNotifications} from "../../../models/notification.model";
import {bulkInsertIds} from "../../../models/model-base";
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
  await postBuilder.prepare();

  const subscriberIds = await author.getSubscriberIds();
  const mentionIds = postBuilder[$mentionIds];
  let rawMentionAlikes: RawAlikeNotifications | undefined;
  await db.inTransaction(async (connection) => {
    const postId = await PostModel.insert(postBuilder, connection);

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

    if (!_.isEmpty(mentionIds)) {
      const rawMentionActivities: RawMentionActivities = {
        mentionIds,
        subjectId: author[$id],
        timestamp,
        contextId: postId,
        contextType: Activity.ContextTypes.Post
      };
      const rawMentionNotifications: RawBulkNotifications = {
        recipientIds: mentionIds,
        activityIds: bulkInsertIds(await ActivityModel.insertMentions(rawMentionActivities, connection)),
        timestamp
      };

      rawMentionAlikes = {
        notificationIds: bulkInsertIds(await NotificationModel.insertBulkNotifications(rawMentionNotifications, connection)),
        recipientIds: mentionIds,
        subjectId: rawMentionActivities.subjectId,
        contextId: rawMentionActivities.contextId,
        contextType: rawMentionActivities.contextType,
        timestamp,
        objectType: Activity.ObjectTypes.User,
        actionType: Activity.UserActions.Mention,
      };
    }
  });
  respondWith(res, 200);
  if (rawMentionAlikes) {
    await messengerService.postRawAlikeNotifications(rawMentionAlikes);
  }
};

export const deletePostById = async function(req: Request, res: Response, next: NextFunction) {
  const postId = postObfuscator.unObfuscate(req.params.id);
  console.log(postId);
  if (INVALID_NUMERIC_ID === postId) {
    return respondWith(res, 404);
  }
  const author = getRequestUser(req);
  const result = await PostModel.deleteByAuthor({
    postId,
    authorId: author[$id]
  });
  return respondWith(res, result ? 200 : 403);
};
