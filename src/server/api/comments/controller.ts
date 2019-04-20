import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {utcTimestamp} from "../../../shared/utils";
import {Activity} from "../../../shared/interf";
import db from "../../persistence/index";
import {$id, commentObfuscator, INVALID_NUMERIC_ID} from "../../service/obfuscator.service";
import {ActivityModel, RawActivity} from "../../models/activity.model";
import {NotificationModel, RawNotification} from "../../models/notification.model";
import {CommentModel, CommentObserver} from "../../models/comment.model";
import {getRequestUser} from "../../service/auth.service";
import {messengerService} from "../../service/messenger.service";


export const plusComment = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const commentId = commentObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== commentId) {
    const observer = getRequestUser(req);
    const commentObserver: CommentObserver = {
      commentId, observerId: observer[$id]
    };

    const {commentAuthorId, postId} = await CommentModel.getAuthorIdPostIdIfAccessible(commentObserver);

    if (INVALID_NUMERIC_ID !== commentAuthorId) {
      const isAuthor = commentAuthorId === observer[$id];
      let rawActivity: RawActivity;
      let rawNotification: RawNotification;
      let notificationId: number;
      const timestamp = utcTimestamp();
      await db.inTransaction(async (conn) => {
        await conn.query('INSERT INTO CommentPlusOnes (commentId, userId) VALUES (:commentId, :observerId)', commentObserver);
        rawActivity = {
          subjectId: observer[$id],
          objectId: commentId,
          objectType: Activity.ObjectTypes.Post,
          actionType: Activity.ContentActions.PlusOne,
          timestamp,
        };
        const activityId = await ActivityModel.insert(rawActivity, conn);
        if (!isAuthor) {
          rawNotification = {
            recipientId: commentAuthorId,
            activityId,
            timestamp,
          };
          notificationId = await NotificationModel.insert(rawNotification, conn);
        }
        await conn.query('UPDATE Comments SET plusCount = plusCount + 1 WHERE id = :commentId', commentObserver);
      });
      respondWith(res, 200);
      if (!isAuthor) {
        return messengerService.postRawNotification({
          rawActivity: rawActivity!,
          rawNotification: rawNotification!,
          notificationId: notificationId!,
          contextExtraId: postId
        });
      }
      return;
    }
  }
  return respondWith(res, 404);
};

export const unPlusComment = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const commentId = commentObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== commentId) {
    const observer = getRequestUser(req);
    const commentObserver: CommentObserver = {
      commentId, observerId: observer[$id]
    };
    if (await CommentModel.isAccessible(commentObserver)) {
      await db.inTransaction(async (conn) => {
        const [result] = await conn.query('DELETE FROM CommentPlusOnes WHERE commentId = :commentId AND userId = :observerId', commentObserver);
        if (!result || 1 !== (result as any).affectedRows) {
          throw Error('No plus one to delete!');
        }
        await conn.query('UPDATE Comments SET plusCount = plusCount - 1 WHERE id = :commentId', commentObserver);
      });
      return respondWith(res, 200);
    }
  }
  return respondWith(res, 404);
};
