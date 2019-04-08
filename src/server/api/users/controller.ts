import {NextFunction, Request, Response} from "express";
import {UserModel} from "../../models/user-model";
import {respondWith} from "../../utils/index";

export const createUser = async function(req: Request, res: Response, next: NextFunction) {
  await UserModel.create(req.body);
  respondWith(res, 200);
};
