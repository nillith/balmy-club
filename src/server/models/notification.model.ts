import {$activityId, $recipientId} from "../service/obfuscator.service";
import {DatabaseDriver, DatabaseRecordBase, insertReturnId} from "./model-base";
import {devOnly, isNumericId} from "../utils/index";
import {isValidTimestamp} from "../../shared/utils";
import db from "../persistence/index";

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
  console.assert(!recipientIds || !recipientIds.length, `no recipients`);
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
}

export class NotificationModel {

  static async insert(raw: RawNotification, drive: DatabaseDriver = db): Promise<number> {
    assertValidRawNotification(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }

  static async broadcastInsert(params: BroadcastParams, drive: DatabaseDriver = db) {
    assertBroadcastParams(params);
    const {recipientIds, activityId, timestamp} = params;
    return drive.query(SQLs.BROADCAST_INSERT as string, [recipientIds.map((id) => {
      return [id, activityId, timestamp];
    })]);
  }

  static async getUnreadCountForUser(userId: number, drive: DatabaseDriver = db): Promise<number> {
    const [[{count}]] = await db.query(SQLs.UNREAD_COUNT as string, {
      userId
    }) as any;
    return count;
  }
}
