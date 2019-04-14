import {NextFunction, Request, Response} from "express";
import {$user} from "../../constants/symbols";
import {respondWith} from "../../utils/index";
import {passwordFormatIsValid} from "../../models/user.model";
import {isValidCircleName} from "../../../shared/utils";
import {isString} from "util";
import {CircleModel} from "../../models/circle.model";
import db from "../../persistence/index";

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body && req.body.password;
  if (!passwordFormatIsValid(password)) {
    respondWith(res, 400);
  }
  const user = req[$user];
  await user.changePassword(password);
  respondWith(res, 200);
};


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

  await circle.insertIntoDatabase(db);
  return respondWith(res, 200);
};

export const removeCircle = async function(req: Request, res: Response, next: NextFunction) {

};
