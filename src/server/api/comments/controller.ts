import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {utcTimestamp} from "../../../shared/utils";
import {Activity} from "../../../shared/interf";
import {$user} from "../../constants/symbols";
import db from "../../persistence/index";
import {ActivityModel} from "../../models/activity.model";
import {NotificationModel} from "../../models/notification.model";
import {commentObfuscator, INVALID_NUMERIC_ID} from "../../service/obfuscator.service";
import {CommentModel, CommentViewer} from "../../models/comment.model";


export const plusComment = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const commentId = commentObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== commentId) {
    const viewer = req[$user];
    const postViewer: CommentViewer = {
      commentId, viewerId: viewer.id
    };
    if (await CommentModel.isAccessible(postViewer)) {
      const timestamp = utcTimestamp();
      await db.inTransaction(async (conn) => {
        await conn.query('INSERT INTO CommentPlusOnes (commentId, userId) VALUES (:commentId, :viewerId)', postViewer);
        const activity = new ActivityModel(viewer.id, commentId, Activity.ObjectTypes.Post, Activity.ContentActions.PlusOne, timestamp);
        await activity.insertIntoDatabase(conn);
        const notification = new NotificationModel(viewer.id, activity.id as number, timestamp);
        await notification.insertIntoDatabase(conn);
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
    const viewer = req[$user];
    const postViewer: CommentViewer = {
      commentId, viewerId: viewer.id
    };
    if (await CommentModel.isAccessible(postViewer)) {
      await db.inTransaction(async (conn) => {
        const [result] = await conn.query('DELETE FROM CommentPlusOnes WHERE commentId = :commentId AND userId = :viewerId', postViewer);
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
