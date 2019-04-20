import {
  $activityId,
  $contextExtraId,
  $contextId,
  $id,
  $objectId,
  $outboundCloneFields,
  $recipientId,
  $subjectId,
  commentObfuscator,
  notificationObfuscator,
  postObfuscator,
  userObfuscator
} from "../service/obfuscator.service";
import {DatabaseDriver, DatabaseRecordBase, fromDatabaseRow, insertReturnId} from "./model-base";
import {devOnly, isNumericId} from "../utils/index";
import {isValidTimestamp} from "../../shared/utils";
import db from "../persistence/index";
import {Activity} from "../../shared/interf";
import _ from 'lodash';
import {assertValidRawActivity, RawActivity} from "./activity.model";
import {UserRecord} from "./user.model";

export class NotificationRecord extends DatabaseRecordBase {
  [$recipientId]: number;
  [$activityId]?: number;
  timestamp: number;
  isRead: boolean;

  constructor(id: number, recipientId: number, activityId: number, timestamp: number, isRead: boolean) {
    super(id);
    this[$recipientId] = recipientId;
    this[$activityId] = activityId;
    this.timestamp = timestamp;
    this.isRead = isRead;
  }
}

const ObjectIdObfuscator = {
  [Activity.ObjectTypes.Post]: postObfuscator,
  [Activity.ObjectTypes.Comment]: commentObfuscator,
  [Activity.ObjectTypes.User]: userObfuscator,
};

const ContextIdObfuscator = {
  [Activity.ContextTypes.Post]: postObfuscator,
  [Activity.ContextTypes.Comment]: commentObfuscator,
};

export interface RawNotificationMessage {
  rawActivity: RawActivity;
  rawNotification: RawNotification;
  notificationId: number;
  contextExtraId?: number;
  recipient?: UserRecord;
}

export const assertValidRawNotificationMessage = devOnly(function(data: any) {
  assertValidRawActivity(data.rawActivity);
  assertValidRawNotification(data.rawNotification);
  console.assert(isNumericId(data.notificationId), `invalid notificationId ${data.notificationId}`);
});


export class NotificationDataRecord extends DatabaseRecordBase {
  static readonly [$outboundCloneFields] = [
    'subjectNickname',
    'subjectAvatarUrl',
    'objectType',
    'actionType',
    'timestamp',
    'contextType',
  ];
  [$subjectId]: number;
  [$objectId]: number;
  [$contextId]: number;
  [$contextExtraId]?: number;


  constructor(id: number, subjectId: number,
              objectId: number,
              contextId: number,
              public subjectNickname: string,
              public subjectAvatarUrl: string,
              public objectType: number,
              public actionType: number,
              public timestamp: number,
              public contextType: number) {
    super(id);
    this[$subjectId] = subjectId;
    this[$objectId] = objectId;
    this[$contextId] = contextId;
  }

  obfuscateCloneTo(obj: any): void {
    const _this = this;
    obj.id = notificationObfuscator.obfuscate(_this[$id]);
    obj.subjectId = userObfuscator.obfuscate(_this[$subjectId]);
    obj.objectId = ObjectIdObfuscator[obj.objectType].obfuscate(_this[$objectId]);
    if (obj[$contextId]) {
      obj.contextId = ContextIdObfuscator[obj.contextType].obfuscate(_this[$contextId]);
      if (Activity.ContextTypes.Comment === _this.contextType) {
        obj.contextExtraId = postObfuscator.obfuscate(_this[$contextExtraId]!);
      }
    }
  }

  hideCloneFrom(obj: any): void {
    const _this = this;
    _this[$id] = obj.id;
    _this[$subjectId] = obj.subjectId;
    _this[$objectId] = obj.objectId;
    _this[$contextId] = obj.contextId;
    _this[$contextExtraId] = obj.contextExtraId;
  }

  static async fromRawNotificationMessage(data: RawNotificationMessage): Promise<NotificationDataRecord | undefined> {
    assertValidRawNotificationMessage(data);
    const result = Object.create(NotificationDataRecord.prototype);
    const rawActivity = data.rawActivity;
    result[$id] = data.notificationId;
    result[$contextExtraId] = data.contextExtraId;
    result[$subjectId] = rawActivity.subjectId;
    result[$objectId] = rawActivity.objectId;
    result[$contextId] = rawActivity.contextId;
    result.objectType = rawActivity.objectType;
    result.actionType = rawActivity.actionType;
    result.timestamp = rawActivity.timestamp;
    result.contextType = rawActivity.contextType;

    let recipient = data.recipient as any;
    if (!recipient) {
      const [rows] = await db.query(`SELECT nickname, avatarUrl FROM Users WHERE id =:recipientId`, data.rawNotification);
      if (rows && rows[0]) {
        recipient = rows[0] as any;
      }
    }
    if (recipient) {
      result.subjectNickname = recipient.nickname;
      result.subjectAvatarUrl = recipient.avatarUrl;
      return result;
    }
  }
}

export interface RawNotification {
  recipientId: number;
  activityId: number;
  timestamp: number;
}

export const assertValidRawNotification = devOnly(function(data: any) {
  console.assert(isNumericId(data.recipientId), `invalid recipientId: ${data.recipientId}`);
  console.assert(isNumericId(data.activityId), `invalid activityId: ${data.activityId}`);
  console.assert(isValidTimestamp(data.timestamp), `invalid timestamp: ${data.timestamp}`);
});

export interface BroadcastParams {
  recipientIds: number[];
  activityId: number;
  timestamp: number;
}

const assertBroadcastParams = devOnly(function(data: any) {
  const {recipientIds, activityId, timestamp} = data;
  console.assert(recipientIds && recipientIds.length, `no recipients`);
  for (let id of recipientIds) {
    console.assert(isNumericId(id), `invalid recipient id ${id}`);
  }
  console.assert(isNumericId(activityId), `invalid activityId ${activityId}`);
  console.assert(isValidTimestamp(timestamp), `invalid timestamp ${timestamp}`);
});

const enum SQLs {
  INSERT = 'INSERT INTO Notifications (recipientId, activityId, `timestamp`) VALUES (:recipientId, :activityId, :timestamp)',
  BROADCAST_INSERT = 'INSERT INTO Notifications (recipientId, activityId, `timestamp`) VALUES ?',
  UNREAD_COUNT = 'SELECT COUNT(id) AS count FROM Notifications WHERE recipientId = :userId AND NOT isRead',
  USER_NOTIFICATIONS = 'SELECT Notifications.id, Activities.subjectId, Users.nickname AS subjectNickname, Users.avatarUrl AS subjectAvatarUrl, Activities.objectId, Activities.contextId, Activities.objectType, Activities.actionType, Activities.contextType FROM Notifications LEFT JOIN Activities ON (Notifications.activityId = Activities.id) LEFT JOIN Users ON (Activities.subjectId = Users.id) WHERE recipientId = :userId AND NOT isRead AND Activities.id IS NOT NULL ORDER BY Notifications.timestamp DESC LIMIT 100;'
}

export interface NotificationObserver {
  notificationId: number;
  userId: number;
  isRead: boolean;
}

const assertValidNotificationObserver = devOnly(function(data: any) {
  console.assert(isNumericId(data.notificationId), `invalid notification id ${data.notificationId}`);
  console.assert(isNumericId(data.userId), `invalid notification id ${data.userId}`);
});

export class NotificationModel {

  static async insert(raw: RawNotification, driver: DatabaseDriver = db): Promise<number> {
    assertValidRawNotification(raw);
    return insertReturnId(SQLs.INSERT as string, raw, driver);
  }

  static async create(raw: RawNotification, drive: DatabaseDriver = db): Promise<NotificationRecord> {
    const id = await this.insert(raw, drive);
    const row = Object.create(raw);
    row.id = id;
    return fromDatabaseRow(row, NotificationRecord);
  }

  static async broadcastInsert(params: BroadcastParams, driver: DatabaseDriver = db) {
    assertBroadcastParams(params);
    const {recipientIds, activityId, timestamp} = params;
    return driver.query(SQLs.BROADCAST_INSERT as string, [recipientIds.map((id) => {
      return [id, activityId, timestamp];
    })]);
  }

  static async getUnreadCountForUser(userId: number, driver: DatabaseDriver = db): Promise<number> {
    const [[{count}]] = await driver.query(SQLs.UNREAD_COUNT as string, {
      userId
    }) as any;
    return count;
  }

  static async getUserNotifications(userId: number, driver: DatabaseDriver = db): Promise<NotificationDataRecord[]> {
    const [rows] = await driver.query(SQLs.USER_NOTIFICATIONS as string, {userId}) as any;
    const contextIdToNotification: any = {};
    const commentIds: number[] = [];
    const results = _.map(rows, (row) => {
      const notification = fromDatabaseRow(row, NotificationDataRecord);
      if (notification.contextType === Activity.ContextTypes.Post) {
        contextIdToNotification[row.contextId] = notification;
        commentIds.push(notification[$contextId]);
      }
      return notification;
    });
    if (commentIds.length) {
      const [postIds] = await driver.query(`SELECT id AS commentId, postId FROM Comments WHERE id IN (:commentIds)`, {
        commentIds
      });
      _.each(postIds, ({commentId, postId}) => {
        contextIdToNotification[commentId][$contextExtraId] = postId;
      });
    }
    return results;
  }

  static async updateNotificationRead(params: NotificationObserver, driver: DatabaseDriver = db) {
    assertValidNotificationObserver(params);
    const [result] = await driver.query(`UPDATE Notifications SET isRead = :isRead WHERE recipientId = :userId AND id = :notificationId`, params);
    return (result as any).affectedRows === 1;
  }
}
