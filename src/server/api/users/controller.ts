import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import {INVALID_NUMERIC_ID, userObfuscator} from "../../service/obfuscator.service";
import {UserModel} from "../../models/user.model";
import {isValidStringId} from "../../../shared/utils";

export const createUser = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 405);
};

export const getUserById = async function(req: Request, res: Response, next: NextFunction) {
  const {id} = req.params;
  if (isValidStringId(id)) {
    const userId = userObfuscator.unObfuscate(id);
    if (INVALID_NUMERIC_ID !== userId) {
      const user = await UserModel.getUserPublicDataById(userId);
      if (user) {
        return res.json(user);
      }
    }
  }
  return respondWith(res, 404);
};


export const getUserPosts = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 405);
};
