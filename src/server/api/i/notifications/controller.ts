import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../../utils/index";
import {NotificationModel} from "../../../models/notification.model";
import {getRequestUser} from "../../../service/auth.service";
import {$id} from "../../../service/obfuscator.service";


export const getNotifications = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  const notifications = await NotificationModel.getUserNotifications(user[$id]);
  return res.json(notifications);
};


export const getUnreadCount = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  const count = await NotificationModel.getUnreadCountForUser(user[$id]);
  respondWith(res, 200, String(count));
};
