import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../../utils/index";
import {NotificationModel} from "../../../models/notification.model";
import {getRequestUser} from "../../../service/auth.service";
import {$id, INVALID_NUMERIC_ID, notificationObfuscator} from "../../../service/obfuscator.service";


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


const updateNotificationReadFuns = function(isRead: boolean) {
  return async function(req: Request, res: Response, next: NextFunction) {
    const notificationId = notificationObfuscator.unObfuscate(req.params.id);
    if (INVALID_NUMERIC_ID === notificationId) {
      return respondWith(res, 404);
    }

    const user = getRequestUser(req);
    const succeed = await NotificationModel.updateNotificationRead({
      notificationId,
      userId: user[$id],
      isRead
    });
    if (succeed) {
      return respondWith(res, 200);
    }
    respondWith(res, 400);
  };
};


export const markNotificationAsRead = updateNotificationReadFuns(true);
export const markNotificationAsUnread = updateNotificationReadFuns(false);
