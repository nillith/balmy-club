import {NextFunction, Request, Response} from "express";
import _ from 'lodash';
import {isValidPostContent, utcTimestamp} from "../../../../shared/utils";
import {$id, postObfuscator} from "../../../service/obfuscator.service";
import {isNumericId, respondWith} from "../../../utils/index";
import {isString} from "util";
import db from "../../../persistence/index";
import {Activity} from "../../../../shared/interf";
import {PostModel, PostViewer} from "../../../models/post.model";
import {ActivityModel, RawActivity} from "../../../models/activity.model";
import {BroadcastParams, NotificationModel, RawNotification} from "../../../models/notification.model";
import {CommentBuilder, CommentModel, PublishCommentData} from "../../../models/comment.model";
import {getRequestUser} from "../../../service/auth.service";
import {PublishCommentRequest} from "../../../../shared/contracts";


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
  console.log(payload);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }

  const commenter = getRequestUser(req);
  const postViewer: PostViewer = {
    postId: payload.postId,
    observerId: commenter[$id]
  };
  if (!await PostModel.isAccessible(postViewer)) {
    return respondWith(res, 400);
  }

  const timestamp = utcTimestamp();
  const comment = new CommentBuilder(commenter[$id], payload.postId, payload.content, timestamp);

  const [mentions, rawComment] = await comment.build();
  const commenterIds = await PostModel.getOtherCommenterIds(postViewer);
  await db.inTransaction(async (connection) => {
    const commentId = await CommentModel.insert(rawComment, connection);
    const rawActivity: RawActivity = {
      subjectId: commenter[$id],
      objectId: commentId,
      objectType: Activity.ObjectTypes.Comment,
      actionType: Activity.ContentActions.Create,
      timestamp,
    };
    const commentActivityId = await ActivityModel.insert(rawActivity, connection);
    if (!_.isEmpty(mentions)) {
      await (Promise as any).map(mentions, async (m) => {
        const rawMentionActivity = {
          subjectId: commenter[$id],
          objectId: m.id,
          objectType: Activity.ObjectTypes.User,
          actionType: Activity.UserActions.Mention,
          timestamp,
        };
        const mentionActivityId = await ActivityModel.insert(rawMentionActivity as RawActivity, connection);
        const rawNotification: RawNotification = {
          recipientId: m.id,
          activityId: mentionActivityId,
          timestamp,
        };
        await NotificationModel.insert(rawNotification, connection);
      });
    }

    if (!_.isEmpty(commenterIds)) {
      const params: BroadcastParams = {
        recipientIds: commenterIds as number[],
        activityId: commentActivityId,
        timestamp,
      };

      await NotificationModel.broadcastInsert(params, connection);
    }
  });
  respondWith(res, 200);
};
