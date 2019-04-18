import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {utcTimestamp} from "../../../shared/utils";
import {Activity} from "../../../shared/interf";
import db from "../../persistence/index";
import {$id, commentObfuscator, INVALID_NUMERIC_ID} from "../../service/obfuscator.service";
import {ActivityModel} from "../../models/activity.model";
import {NotificationModel, RawNotification} from "../../models/notification.model";
import {CommentModel, CommentViewer} from "../../models/comment.model";
import {getRequestUser} from "../../service/auth.service";


export const plusComment = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const commentId = commentObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== commentId) {
    const observer = getRequestUser(req);
    const postViewer: CommentViewer = {
      commentId, observerId: observer[$id]
    };
    if (await CommentModel.isAccessible(postViewer)) {
      const timestamp = utcTimestamp();
      await db.inTransaction(async (conn) => {
        await conn.query('INSERT INTO CommentPlusOnes (commentId, userId) VALUES (:commentId, :observerId)', postViewer);
        const rawActivity = {
          subjectId: observer[$id],
          objectId: commentId,
          objectType: Activity.ObjectTypes.Post,
          actionType: Activity.ContentActions.PlusOne,
          timestamp,
        };
        const activityId = await ActivityModel.insert(rawActivity, conn);
        const rawNotification: RawNotification = {
          recipientId: observer[$id],
          activityId,
          timestamp,
        };
        await NotificationModel.insert(rawNotification, conn);
        await conn.query('UPDATE Comments SET plusCount = plusCount + 1 WHERE id = :commentId', postViewer);
      });
      return respondWith(res, 200);
    }
  }
  return respondWith(res, 404);
};

export const unPlusComment = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const commentId = commentObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== commentId) {
    const observer = getRequestUser(req);
    const postViewer: CommentViewer = {
      commentId, observerId: observer[$id]
    };
    if (await CommentModel.isAccessible(postViewer)) {
      await db.inTransaction(async (conn) => {
        const [result] = await conn.query('DELETE FROM CommentPlusOnes WHERE commentId = :commentId AND userId = :observerId', postViewer);
        if (!result || 1 !== (result as any).affectedRows) {
          throw Error('No plus one to delete!');
        }
        await conn.query('UPDATE Comments SET plusCount = plusCount - 1 WHERE id = :commentId', postViewer);
      });
      return respondWith(res, 200);
    }
  }
  return respondWith(res, 404);
};
