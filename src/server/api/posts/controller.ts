import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {isValidTimestamp, utcTimestamp} from "../../../shared/utils";
import {Activity} from "../../../shared/interf";
import {POSTS_GROUP_SIZE} from "../../../shared/constants";
import {PostModel, PostObserver} from "../../models/post.model";
import db from "../../persistence/index";
import {$id, INVALID_NUMERIC_ID, postObfuscator} from "../../service/obfuscator.service";
import {ActivityModel, RawActivity} from "../../models/activity.model";
import {NotificationModel, RawNotification} from "../../models/notification.model";
import {CommentModel} from "../../models/comment.model";
import {getRequestUser} from "../../service/auth.service";
import {messengerService} from "../../service/messenger.service";

export const getPublicStreamPosts = async function(req: Request, res: Response, next: NextFunction) {
  const {query} = req;
  const timestamp = Math.floor(parseFloat(query.t));
  const group = Math.floor(parseFloat(query.g));

  if (!isValidTimestamp(timestamp) || group < 0) {
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
  }
  respondWith(res, 200, JSON.stringify(posts));
};

export const getPostById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const observer = getRequestUser(req);
    const postViewer = {
      postId,
      observerId: observer[$id]
    };
    const post = await PostModel.getPostById(postViewer);
    if (post) {
      post.comments = await CommentModel.getCommentsForPost(postViewer);
      return res.json(post);
    }
  }
  return respondWith(res, 404);
};

export const plusPost = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const observer = getRequestUser(req);
    const postViewer: PostObserver = {
      postId, observerId: observer[$id]
    };
    const authorId = await PostModel.getAuthorIdIfAccessible(postViewer);
    if (INVALID_NUMERIC_ID !== authorId) {
      const isAuthor = authorId === observer[$id];
      let rawActivity: RawActivity;
      let rawNotification: RawNotification;
      let notificationId: number;
      const timestamp = utcTimestamp();
      await db.inTransaction(async (conn) => {
        await conn.query('INSERT INTO PostPlusOnes (postId, userId) VALUES (:postId, :observerId)', postViewer);

        rawActivity = {
          subjectId: observer[$id],
          objectId: postId,
          objectType: Activity.ObjectTypes.Post,
          actionType: Activity.ContentActions.PlusOne,
          timestamp,
        };
        const activityId = await ActivityModel.insert(rawActivity, conn);
        if (!isAuthor) {
          rawNotification = {
            recipientId: authorId,
            activityId,
            timestamp,
          };
          notificationId = await NotificationModel.insert(rawNotification, conn);
        }
        await conn.query('UPDATE Posts SET plusCount = plusCount + 1 WHERE id = :postId', postViewer);
      });
      respondWith(res, 200);
      if (!isAuthor) {
        return messengerService.postRawNotification({
          rawActivity: rawActivity!,
          rawNotification: rawNotification!,
          notificationId: notificationId!,
        });
      }
      return;
    }
  }
  return respondWith(res, 404);
};

export const unPlusPost = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const postId = postObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== postId) {
    const observer = getRequestUser(req);
    const postViewer: PostObserver = {
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
