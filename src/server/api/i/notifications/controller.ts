import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../../utils/index";
import db from "../../../persistence/index";
import {NotificationModel} from "../../../models/notification.model";
import {getRequestUser} from "../../../service/auth.service";
import {$id} from "../../../service/obfuscator.service";

const GET_NOTIFICATIONS = 'SELECT Notifications.id, Activities.subjectId, Activities.objectId, Activities.contextId, Activities.objectType, Activities.actionType, Activities.contextType FROM Notifications LEFT JOIN Activities ON (Notifications.activityId = Activities.id) WHERE recipientId = :userId AND NOT isRead ORDER BY Notifications.timestamp DESC LIMIT 100';

export const getNotifications = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  const [rows] = await db.query(GET_NOTIFICATIONS, {
    userId: user[$id]
  });
  return res.json(rows);
};


export const getUnreadCount = async function(req: Request, res: Response, next: NextFunction) {
  const user = getRequestUser(req);
  const count = await NotificationModel.getUnreadCountForUser(user[$id]);
  respondWith(res, 200, String(count));
};
