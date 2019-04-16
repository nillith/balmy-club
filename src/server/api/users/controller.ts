import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {INVALID_NUMERIC_ID, userObfuscator} from "../../service/obfuscator.service";
import {UserModel} from "../../models/user.model";
import {respondWithJson} from "../../init";
import {$user} from "../../constants/symbols";
import {isValidTimestamp} from "../../../shared/utils";
import {PostModel} from "../../models/post.model";
import {CommentModel} from "../../models/comment.model";
import {POSTS_GROUP_SIZE} from "../../../shared/constants";

export const createUser = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 405);
};


export const getUserById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  const userId = userObfuscator.unObfuscate(id);
  if (INVALID_NUMERIC_ID !== userId) {
    const viewer = req[$user];
    const user = await UserModel.getUserPublicDataById(viewer.id, userId);
    if (user) {
      return respondWithJson(res, user);
    }
  }
  return respondWith(res, 404);
};

export const getUserPosts = async function(req: Request, res: Response, next: NextFunction) {

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

  const viewer = req[$user];
  if (await viewer.isBlockByUser(userId)) {
    return respondWith(res, 204);
  }

  const params = {
    userId,
    timestamp,
    offset: group * POSTS_GROUP_SIZE,
    viewerId: viewer.id,
  };
  let posts = await PostModel.getUserPosts(params);

  if (!posts.length) {
    return respondWith(res, 200);
  }
  // posts = posts.map(p => p.getOutboundData());
  for (const p of posts) {
    p.comments = await CommentModel.getCommentsByPostId(p.id as number);
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
