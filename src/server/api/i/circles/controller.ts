import {NextFunction, Request, Response} from "express";
import {isValidCircleName, isValidStringId} from "../../../../shared/utils";
import {isString} from "util";
import {respondWith} from "../../../utils/index";
import {$user} from "../../../constants/symbols";
import {CircleModel, UserCircleUpdateData} from "../../../models/circle.model";
import db from "../../../persistence/index";
import {$id, batchCircleObfuscator, INVALID_NUMERIC_ID, userObfuscator} from "../../../service/obfuscator.service";

const getCreateCirclePayloadOrErr = function(body: any) {
  let {name, userIds} = body;
  if (!isValidCircleName(name)) {
    return 'invalid circle name!';
  }
  return {name, userIds};
};

export const createCircle = async function(req: Request, res: Response, next: NextFunction) {
  const data = getCreateCirclePayloadOrErr(req.body);
  if (isString(data)) {
    return respondWith(res, 400);
  }
  const user = req[$user];
  if (!user) {
    return respondWith(res, 401);
  }

  const circle = CircleModel.unObfuscateFrom(data);
  if (!circle) {
    return respondWith(res, 400);
  }
  circle.ownerId = user.id;
  await circle.insertIntoDatabase(db);
  circle.obfuscate();
  return respondWith(res, 200, circle[$id]);
};

export const getAllMyCircles = async function(req: Request, res: Response, next: NextFunction) {
  const user = req[$user];
  const data = await CircleModel.getAllCircleForUser(user.id);
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

  return {userId, addCircleIds, removeCircleIds} as UserCircleUpdateData;
};
export const changeUserCircles = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getChangeUserCirclesPayloadOrErr(req.body);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }

  if (payload.addCircleIds || payload.removeCircleIds) {
    const user = req[$user];
    payload.ownerId = user.id;
    await CircleModel.updateUserCircle(payload);
  }


  return respondWith(res, 200);
};


export const removeCircle = async function(req: Request, res: Response, next: NextFunction) {
  return respondWith(res, 405);
};


