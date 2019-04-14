import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {isValidObfuscatedIdFormat} from "../../service/obfuscator.service";
import {Activity, isValidPostVisibility, PostVisibilities} from "../../../shared/interf";
import {isValidPostContent, utcTimestamp} from "../../../shared/utils";
import {MAX_VISIBLE_CIRCLE_NUMBER} from "../../../shared/constants";
import {isString} from "util";
import {PostModel} from "../../models/post.model";
import {$user} from "../../constants/symbols";
import db from "../../persistence/index";
import {ActivityModel} from "../../models/activity.model";
import {NotificationModel} from "../../models/notification.model";
import _ from 'lodash';

// authorId?: number | string;
// [$authorId]?: string;
// reShareFromPostId?: number | string;
// [$reShareFromPostId]?: string;
// visibility?: PostVisibilities;
// [$authorId]?: string;
// content?: string;

const filterShareCircleIds = function(circleIds: any) {
  const result: any[] = [];
  if (circleIds && circleIds.length) {
    const end = Math.max(MAX_VISIBLE_CIRCLE_NUMBER, circleIds.length);
    let id;
    for (let i = 0; i < end; ++i) {
      id = circleIds[i];
      if (isValidObfuscatedIdFormat(id)) {
        result.push(id);
      }
    }
  }
  return result;
};


const getNewPostPayloadOrErr = function(body: any) {
  let {reShareFromPostId, visibility, content, visibleCircleIds} = body;
  content = String(content || '').trim();
  if (reShareFromPostId) {
    if (!isValidObfuscatedIdFormat(reShareFromPostId)) {
      return `invalid reshare post id`;
    }
  }

  if (!content && !reShareFromPostId) {
    return `no post content`;
  } else if (!isValidPostContent(content)) {
    return `invalid content length`;
  }

  if (!visibility && visibleCircleIds && visibleCircleIds.length) {
    visibility = PostVisibilities.Private;
  }

  if (!isValidPostVisibility(visibility)) {
    return `invalid post visibility!`;
  }

  if (visibility !== PostVisibilities.Private) {
    visibleCircleIds = undefined;
  } else {
    visibleCircleIds = filterShareCircleIds(visibleCircleIds);
  }

  return {reShareFromPostId, visibility, content, visibleCircleIds};
};


export const publishNewPost = async function(req: Request, res: Response, next: NextFunction) {
  const {body} = req;

  const data = getNewPostPayloadOrErr(body);
  if (isString(data)) {
    return respondWith(res, 400, data);
  }

  const post = PostModel.unObfuscateFrom(data);
  if (!post) {
    return respondWith(res, 400);
  }

  const user = req[$user];
  if (!user) {
    return respondWith(res, 401);
  }

  const timestamp = utcTimestamp();
  post.authorId = user.id;
  post.createdAt = timestamp;

  let mentions = post.extractMentionsFromContent();
  if (!_.isEmpty(mentions)) {
    mentions = await post.sanitizeContentMentions(mentions);
  }
  post.mentionIds = mentions.map((m) => m.id);
  const subscriberIds = await user.getSubscriberIds();

  await db.inTransaction(async (connection) => {
    await post.insertIntoDatabase(connection);
    const activity = new ActivityModel(user.id, post.id as number, Activity.ObjectTypes.Post, Activity.ContentActions.Create, timestamp);
    await activity.insertIntoDatabase(connection);
    if (subscriberIds && subscriberIds.length) {
      await NotificationModel.bulkInsertIntoDatabase(connection, subscriberIds, activity.id as number, timestamp);
    }
    if (!_.isEmpty(mentions)) {
      await (Promise as any).map(mentions, async (m) => {
        const mentionActivity = new ActivityModel(user.id, m.id, Activity.ObjectTypes.User, Activity.UserActions.Mention, timestamp, post.id as number, Activity.ContextTypes.Post);
        await mentionActivity.insertIntoDatabase(connection);
        const notification = new NotificationModel(m.id as number, mentionActivity.id as number, timestamp);
        await notification.insertIntoDatabase(connection);
      });
    }
  });
  respondWith(res, 200);
};
