import {NextFunction, Request, Response} from "express";
import {$user} from "../../constants/symbols";
import {respondWith} from "../../utils/index";
import {passwordFormatIsValid} from "../../models/user.model";

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body && req.body.password;
  if (!passwordFormatIsValid(password)) {
    respondWith(res, 400);
  }
  const user = req[$user];
  await user.changePassword(password);
  respondWith(res, 200);
};


export const createCircle = async function(req: Request, res: Response, next: NextFunction) {

};

export const removeCircle = async function(req: Request, res: Response, next: NextFunction) {

};
