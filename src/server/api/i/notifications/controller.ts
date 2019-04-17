import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../../utils/index";
import {$user} from "../../../constants/symbols";
import db from "../../../persistence/index";
import {OutboundDataHolder, respondWithJson} from "../../../init";

const GET_NOTIFICATIONS = 'SELECT Notifications.id, Activities.subjectId, Activities.objectId, Activities.contextId, Activities.objectType, Activities.actionType, Activities.contextType FROM Notifications LEFT JOIN Activities ON (Notifications.activityId = Activities.id) WHERE recipientId = :userId AND NOT isRead ORDER BY Notifications.timestamp DESC LIMIT 100';

export const getNotifications = async function(req: Request, res: Response, next: NextFunction) {
  const user = req[$user];
  const [rows] = await db.query(GET_NOTIFICATIONS, {
    userId: user.id
  });
  // respondWithJson(res, new OutboundDataHolder(rows));
};


export const getUnreadCount = async function(req: Request, res: Response, next: NextFunction) {
  const user = req[$user];
  const [[{count}]] = await db.query(`SELECT COUNT(id) AS count FROM Notifications WHERE recipientId = :userId AND NOT isRead`, {
    userId: user.id
  }) as any;
  respondWith(res, 200, String(count));
};
