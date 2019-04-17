import {NextFunction, Request, Response} from "express";
import {$user} from "../../constants/symbols";
import {respondWith} from "../../utils/index";
import {isValidPassword, isValidTimestamp} from "../../../shared/utils";
import {PostModel} from "../../models/post.model";
import {POSTS_GROUP_SIZE} from "../../../shared/constants";
import {CommentModel} from "../../models/comment.model";

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body && req.body.password;
  if (!isValidPassword(password)) {
    respondWith(res, 400);
  }
  const user = req[$user];
  await user.changePassword(password);
  respondWith(res, 200);
};

export const getHomeTimelinePosts = async function(req: Request, res: Response, next: NextFunction) {
  const {query} = req;
  const timestamp = Math.floor(parseFloat(query.t));
  const group = Math.floor(parseFloat(query.g));

  if (!isValidTimestamp(timestamp) || group < 0) {
    return respondWith(res, 404);
  }

  const viewer = req[$user];
  const params = {
    timestamp,
    offset: group * POSTS_GROUP_SIZE,
    viewerId: viewer.id,
  };

  let posts = await PostModel.getHomeTimelinePosts(params);

  if (!posts.length) {
    return respondWith(res, 200);
  }

  for (const p of posts) {
    p.comments = await CommentModel.getCommentsByPostId({
      postId: p.id as number,
      viewerId: viewer.id
    });
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

