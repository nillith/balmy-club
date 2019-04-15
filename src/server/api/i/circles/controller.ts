import {NextFunction, Request, Response} from "express";
import {isValidCircleName} from "../../../../shared/utils";
import {isString} from "util";
import {respondWith} from "../../../utils/index";
import {$user} from "../../../constants/symbols";
import {CircleModel} from "../../../models/circle.model";
import db from "../../../persistence/index";
import {$id} from "../../../service/obfuscator.service";

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

export const removeCircle = async function(req: Request, res: Response, next: NextFunction) {

};
