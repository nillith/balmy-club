import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {isValidPassword, isValidTimestamp} from "../../../shared/utils";
import {PostModel} from "../../models/post.model";
import {POSTS_GROUP_SIZE} from "../../../shared/constants";
import {CommentModel} from "../../models/comment.model";
import {$id} from "../../service/obfuscator.service";
import {getRequestUser} from "../../service/auth.service";

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body && req.body.password;
  if (!isValidPassword(password)) {
    respondWith(res, 400);
  }
  const user = getRequestUser(req);
  await user.changePassword(password);
  respondWith(res, 200);
};

export const getProfile = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  if (user) {
    return res.json(await user.getLoginData());
  } else {
    respondWith(res, 401);
  }
};

export const getHomeTimelinePosts = async function(req: Request, res: Response, next: NextFunction) {
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

  let posts = await PostModel.getHomeTimelinePosts(params);

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

