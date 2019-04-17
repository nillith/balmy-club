import {NextFunction, Request, Response} from "express";
import {$user} from "../../constants/symbols";
import {respondWith} from "../../utils/index";
import {isValidPassword} from "../../../shared/utils";

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body && req.body.password;
  if (!isValidPassword(password)) {
    respondWith(res, 400);
  }
  const user = req[$user];
  await user.changePassword(password);
  respondWith(res, 200);
};

