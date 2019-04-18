import {NextFunction, Request, Response} from "express";
import {isValidCircleName, isValidStringId, utcTimestamp} from "../../../../shared/utils";
import {isString} from "util";
import {respondWith} from "../../../utils/index";
import db from "../../../persistence/index";
import {
  $id,
  batchCircleObfuscator,
  circleObfuscator,
  INVALID_NUMERIC_ID,
  userObfuscator
} from "../../../service/obfuscator.service";
import {Activity} from "../../../../shared/interf";
import _ from 'lodash';
import {ActivityModel} from "../../../models/activity.model";
import {NotificationModel, RawNotification} from "../../../models/notification.model";
import {CircleModel, RawCircle, UserCircleChanges} from "../../../models/circle.model";
import {getRequestUser} from "../../../service/auth.service";

const getCreateCirclePayloadOrErr = function(body: any) {
  let {name} = body;
  if (!isValidCircleName(name)) {
    return 'invalid circle name!';
  }
  return {name};
};

export const createCircle = async function(req: Request, res: Response, next: NextFunction) {
  const data = getCreateCirclePayloadOrErr(req.body);
  if (isString(data)) {
    return respondWith(res, 400);
  }
  const user = getRequestUser(req);
  if (!user) {
    return respondWith(res, 401);
  }

  (data as any).ownerId = user[$id];
  const circleId = await CircleModel.insert(data as RawCircle);
  return respondWith(res, 200, circleObfuscator.obfuscate(circleId));
};

export const getAllMyCircles = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  const data = await CircleModel.getCirclesByOwnerId(user[$id]);
  return res.json(data);
};

const getChangeUserCirclesPayloadOrErr = function(body: any) {
  let {userId, addCircleIds, removeCircleIds} = body;
  if (!isValidStringId(userId)) {
    return 'invalid user id';
  }
  userId = userObfuscator.unObfuscate(userId);
  if (INVALID_NUMERIC_ID === userId) {
    return 'invalid user id';
  }
  addCircleIds = batchCircleObfuscator.unObfuscate(addCircleIds);
  removeCircleIds = batchCircleObfuscator.unObfuscate(removeCircleIds);
  if (!addCircleIds.length) {
    addCircleIds = undefined;
  }

  if (!removeCircleIds.length) {
    removeCircleIds = undefined;
  }

  return {userId, addCircleIds, removeCircleIds} as UserCircleChanges;
};


async function shouldAddCircleNotification(circlerId: number, circleeId: number): Promise<boolean> {
  const [rows] = await db.query('SELECT id FROM UserBlockUser WHERE blockerId = :circleeId AND blockeeId = :circlerId UNION ALL (SELECT id FROM CircleUser WHERE userId = :circleeId AND circleId IN (SELECT id FROM Circles WHERE ownerId = :circlerId) LIMIT 1)', {
    circlerId, circleeId
  });
  return !_.isEmpty(rows);
}


export const changeUserCircles = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getChangeUserCirclesPayloadOrErr(req.body);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }

  if (payload.addCircleIds || payload.removeCircleIds) {
    const user = getRequestUser(req);
    const ownerId = payload.ownerId = user[$id];
    if (payload.addCircleIds && payload.addCircleIds.length && await shouldAddCircleNotification(ownerId, payload.userId)) {
      await db.inTransaction(async (connection) => {
        const timestamp = utcTimestamp();
        const rawActivity = {
          subjectId: ownerId,
          objectId: payload.userId,
          objectType: Activity.ObjectTypes.User,
          actionType: Activity.UserActions.Circle,
          timestamp,
        };
        const activityId = await ActivityModel.insert(rawActivity, connection);
        const rawNotification: RawNotification = {
          recipientId: payload.userId,
          activityId,
          timestamp,
        };
        await NotificationModel.insert(rawNotification, connection);
        await CircleModel.syncUserCircleChanges(payload, connection);
      });
    } else {
      await CircleModel.syncUserCircleChanges(payload);
    }
  }
  return respondWith(res, 200);
};

export const removeCircle = async function(req: Request, res: Response, next: NextFunction) {
  return respondWith(res, 405);
};

export const getCircleById = async function(req: Request, res: Response, next: NextFunction) {
  return respondWith(res, 405);
};


