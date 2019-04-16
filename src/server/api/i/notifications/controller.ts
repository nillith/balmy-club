import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../../utils/index";

export const getNotification = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 200);
};
