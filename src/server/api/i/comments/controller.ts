import {NextFunction, Request, Response} from "express";
import _ from 'lodash';
import {isValidPostContent, utcTimestamp} from "../../../../shared/utils";
import {postObfuscator} from "../../../service/obfuscator.service";
import {isNumericId, respondWith} from "../../../utils/index";
import {isString} from "util";
import {$user} from "../../../constants/symbols";
import {CommentModel} from "../../../models/comment.model";
import db from "../../../persistence/index";
import {Activity} from "../../../../shared/interf";
import {ActivityModel} from "../../../models/activity.model";
import {NotificationModel} from "../../../models/notification.model";
import {PostModel, PostViewer} from "../../../models/post.model";

export interface PublishCommentRequestPayload {
  postId: number;
  content: string;
}

const getNewCommentPayloadOrErr = function(body: any): PublishCommentRequestPayload | string {
  let {postId, content} = body;
  content = _.trim(content);

  content = String(content || '').trim();
  if (!isValidPostContent(content)) {
    return `invalid comment length`;
  }

  postId = postObfuscator.unObfuscate(postId);
  if (!isNumericId(postId)) {
    return `invalid id`;
  }
  return {postId, content};
};


export const publishComment = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getNewCommentPayloadOrErr(req.body);
  console.log(payload);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }

  const commenter = req[$user];
  const postViewer: PostViewer = {
    postId: payload.postId,
    viewerId: commenter.id
  };
  if (await PostModel.isAccessible(postViewer)) {
    return respondWith(res, 400);
  }

  const comment = new CommentModel();
  const timestamp = utcTimestamp();
  comment.postId = postViewer.postId;
  comment.authorId = commenter.id;
  comment.createdAt = timestamp;
  comment.content = payload.content;

  let mentions = comment.extractMentionsFromContent();
  if (!_.isEmpty(mentions)) {
    mentions = await comment.sanitizeContentMentions(mentions);
  }
  comment.mentionIds = mentions.map((m) => m.id);
  const commenterIds = PostModel.getOtherCommenterIds(postViewer);
  await db.inTransaction(async (connection) => {
    await comment.insertIntoDatabase(connection);
    const commentActivity = new ActivityModel(commenter.id, comment.id as number, Activity.ObjectTypes.Comment, Activity.ContentActions.Create, timestamp);
    await commentActivity.insertIntoDatabase(connection);
    if (!_.isEmpty(mentions)) {
      await (Promise as any).map(mentions, async (m) => {
        const mentionActivity = new ActivityModel(commenter.id, m.id, Activity.ObjectTypes.User, Activity.UserActions.Mention, timestamp, comment.id as number, Activity.ContextTypes.Post);
        await mentionActivity.insertIntoDatabase(connection);
        const notification = new NotificationModel(m.id as number, mentionActivity.id as number, timestamp);
        await notification.insertIntoDatabase(connection);
      });
    }

    if (!_.isEmpty(commenterIds)) {
      await Promise.all(
        _.map(commenterIds, async (commenterId) => {
          const notification = new NotificationModel(commenterId as any as number, commentActivity.id as number, timestamp);
          await notification.insertIntoDatabase(connection);
        }));
    }
  });
  respondWith(res, 200);
};
