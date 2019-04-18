import {
  $activityId,
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
  [Activity.ObjectTypes.Comment]: userObfuscator,
};

const ContextIdObfuscator = {
  [Activity.ContextTypes.Post]: postObfuscator,
  [Activity.ContextTypes.Comment]: commentObfuscator,
};

export class Notification extends DatabaseRecordBase {
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
    const self = this;
    obj.id = notificationObfuscator.obfuscate(self[$id]);
    obj.subjectId = userObfuscator.obfuscate(self[$subjectId]);
    obj.objectId = ObjectIdObfuscator[obj.objectType].obfuscate(self[$objectId]);
    if (obj[$contextId]) {
      obj.contextId = ContextIdObfuscator[obj.contextType].obfuscate(self[$contextId]);
    }
  }

  hideCloneFrom(obj: any): void {
    const self = this;
    self[$id] = obj.id;
    self[$subjectId] = obj.subjectId;
    self[$objectId] = obj.objectId;
    self[$contextId] = obj.contextId;
  }
}

export interface RawNotification {
  recipientId: number;
  activityId: number;
  timestamp: number;
}

const assertValidRawNotification = devOnly(function(data: any) {
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

export class NotificationModel {

  static async insert(raw: RawNotification, driver: DatabaseDriver = db): Promise<number> {
    assertValidRawNotification(raw);
    return insertReturnId(SQLs.INSERT as string, raw, driver);
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

  static async getUserNotifications(userId: number, driver: DatabaseDriver = db): Promise<Notification[]> {
    const [rows] = await driver.query(SQLs.USER_NOTIFICATIONS as string, {userId});
    return _.map(rows, (row) => {
      return fromDatabaseRow(row, Notification);
    });
  }
}
