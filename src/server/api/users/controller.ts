import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {$id, INVALID_NUMERIC_ID, userObfuscator} from "../../service/obfuscator.service";
import {UserModel} from "../../models/user.model";
import {isValidTimestamp} from "../../../shared/utils";
import {PostModel} from "../../models/post.model";
import {POSTS_GROUP_SIZE} from "../../../shared/constants";
import {CommentModel} from "../../models/comment.model";
import {getRequestUser} from "../../service/auth.service";

export const createUser = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 405);
};

export const getUserById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const userId = userObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== userId) {
    const observer = getRequestUser(req);
    const user = await UserModel.findUserByObservation({targetId: userId, observerId: observer[$id]});
    if (user) {
      return res.json(user);
    }
  }
  return respondWith(res, 404);
};

export const getUserStreamPosts = async function(req: Request, res: Response, next: NextFunction) {

  const {id} = req.params;
  const userId = userObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID === userId) {
    return respondWith(res, 404);
  }

  const {query} = req;
  const timestamp = Math.floor(parseFloat(query.t));
  const group = Math.floor(parseFloat(query.g));

  if (!isValidTimestamp(timestamp) || group < 0) {
    return respondWith(res, 404);
  }

  const observer = getRequestUser(req);
  if (await observer.isBlockByUser(userId)) {
    return respondWith(res, 204);
  }

  const params = {
    userId,
    timestamp,
    offset: group * POSTS_GROUP_SIZE,
    observerId: observer[$id],
  };
  let posts = await PostModel.getUserTimelinePosts(params);

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
