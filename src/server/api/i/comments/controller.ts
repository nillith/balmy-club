import {NextFunction, Request, Response} from "express";
import _ from 'lodash';
import {isValidPostContent, utcTimestamp} from "../../../../shared/utils";
import {
  $id,
  $mentionIds,
  commentObfuscator,
  INVALID_NUMERIC_ID,
  postObfuscator
} from "../../../service/obfuscator.service";
import {isNumericId, respondWith} from "../../../utils/index";
import {isString} from "util";
import db from "../../../persistence/index";
import {Activity} from "../../../../shared/interf";
import {PostModel, PostObserver} from "../../../models/post.model";
import {ActivityModel, RawActivity, RawMentionActivities} from "../../../models/activity.model";
import {BroadcastParams, NotificationModel, RawBulkNotifications} from "../../../models/notification.model";
import {CommentBuilder, CommentModel, PublishCommentData} from "../../../models/comment.model";
import {getRequestUser} from "../../../service/auth.service";
import {PublishCommentRequest} from "../../../../shared/contracts";
import {messengerService, RawAlikeNotifications} from "../../../service/messenger.service";
import {bulkInsertIds} from "../../../models/model-base";


const getNewCommentPayloadOrErr = function(body: PublishCommentRequest): PublishCommentData | string {
  let {postId, content} = body;
  content = _.trim(content);

  content = String(content || '').trim();
  if (!isValidPostContent(content)) {
    return `invalid comment length`;
  }

  const postNumId = postObfuscator.unObfuscate(postId);
  if (!isNumericId(postNumId)) {
    return `invalid id`;
  }
  return {postId: postNumId, content};
};


export const publishComment = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getNewCommentPayloadOrErr(req.body);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }

  const commenter = getRequestUser(req);
  const postViewer: PostObserver = {
    postId: payload.postId,
    observerId: commenter[$id]
  };

  const postAuthorId = await PostModel.getAuthorIdIfAccessible(postViewer);

  if (INVALID_NUMERIC_ID === postAuthorId) {
    return respondWith(res, 400);
  }

  const timestamp = utcTimestamp();

  const comment = new CommentBuilder(commenter[$id], payload.postId, payload.content, timestamp);
  await comment.prepare();
  const commentListenerIds = await PostModel.getOtherCommenterIds(postViewer);
  if (postAuthorId !== postViewer.observerId) {
    commentListenerIds.push(postAuthorId);
  }
  const mentionIds: number[] = comment[$mentionIds];
  let rawMentionAlikes: RawAlikeNotifications | undefined;
  let rawCommentAlikes: RawAlikeNotifications | undefined;

  await db.inTransaction(async (connection) => {
    const commentId = await CommentModel.insert(comment, connection);
    const rawCommentActivity: RawActivity = {
      subjectId: commenter[$id],
      objectId: commentId,
      contextType: Activity.ContextTypes.Post,
      contextId: postViewer.postId,
      objectType: Activity.ObjectTypes.Comment,
      actionType: Activity.ContentActions.Create,
      timestamp,
    };
    const commentActivityId = await ActivityModel.insert(rawCommentActivity, connection);

    if (!_.isEmpty(mentionIds)) {
      const rawMentionActivities: RawMentionActivities = {
        mentionIds,
        subjectId: commenter[$id],
        timestamp,
        contextId: commentId,
        contextType: Activity.ContextTypes.Comment
      };
      const rawMentionNotifications: RawBulkNotifications = {
        recipientIds: mentionIds,
        activityIds: bulkInsertIds(await ActivityModel.insertMentions(rawMentionActivities, connection)),
        timestamp
      };

      rawMentionAlikes = {
        notificationIds: bulkInsertIds(await NotificationModel.insertBulkNotifications(rawMentionNotifications, connection)),
        recipientIds: mentionIds,
        subjectId: postViewer.observerId,
        contextId: commentId,
        contextType: Activity.ContextTypes.Comment,
        timestamp,
        contextExtraId: postViewer.postId,
        objectType: Activity.ObjectTypes.User,
        actionType: Activity.UserActions.Mention
      };
    }

    if (!_.isEmpty(commentListenerIds)) {
      const params: BroadcastParams = {
        recipientIds: commentListenerIds,
        activityId: commentActivityId,
        timestamp,
      };

      rawCommentAlikes = {
        notificationIds: bulkInsertIds(await NotificationModel.broadcastInsert(params, connection)),
        recipientIds: commentListenerIds,
        subjectId: rawCommentActivity.subjectId!,
        contextId: rawCommentActivity.contextId!,
        contextType: rawCommentActivity.contextType!,
        timestamp,
        objectType: rawCommentActivity.objectType!,
        actionType: rawCommentActivity.actionType!
      };
    }
  });
  respondWith(res, 200);
  if (rawMentionAlikes) {
    await messengerService.postRawAlikeNotifications(rawMentionAlikes);
  }
  if (rawCommentAlikes) {
    await messengerService.postRawAlikeNotifications(rawCommentAlikes);
  }
};

export const deleteCommentById = async function(req: Request, res: Response, next: NextFunction) {
  const commentId = commentObfuscator.unObfuscate(req.params.id);
  if (INVALID_NUMERIC_ID === commentId) {
    return respondWith(res, 404);
  }
  const author = getRequestUser(req);
  const result = await CommentModel.deleteByAuthor({
    commentId,
    authorId: author[$id]
  });
  return respondWith(res, result ? 200 : 404);
};
