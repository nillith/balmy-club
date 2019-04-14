import {ModelBase} from "./model-base";
import {Connection} from "mysql2/promise";
import {devOnly, isNumericId} from "../utils/index";
import {isValidTimestamp} from "../../shared/utils";
import {$activityId, $recipientId} from "../service/obfuscator.service";

const BULK_INSERT_SQL = 'INSERT INTO Notifications (recipientId, activityId, `timestamp`) VALUES ?';

const INSERT_SQL = 'INSERT INTO Notifications (recipientId, activityId, `timestamp`) VALUES (:recipientId, :activityId, :timestamp)';

const assertBulkInsert = devOnly(function(recipientIds: number[], activityId: number, timestamp: number) {
  console.assert(recipientIds);
  console.assert(recipientIds.length);
  for (let id of recipientIds) {
    console.assert(isNumericId(id));
  }
  console.assert(isNumericId(activityId));
  console.assert(isValidTimestamp(timestamp));
});

const assertValidNew = devOnly(function(model: NotificationModel) {
  console.assert(model.isNew());
  console.assert(isNumericId(model.recipientId));
  console.assert(isNumericId(model.activityId));
  console.assert(isValidTimestamp(model.timestamp));
});

export class NotificationModel extends ModelBase {
  static async bulkInsertIntoDatabase(con: Connection, recipientIds: number[], activityId: number, timestamp: number) {
    assertBulkInsert(recipientIds, activityId, timestamp);
    return con.query(BULK_INSERT_SQL, [recipientIds.map((id) => {
      return [id, activityId, timestamp];
    })]);
  }

  recipientId?: number | string;
  [$recipientId]?: string;
  activityId?: number | string;
  [$activityId]?: string;
  timestamp?: number;
  isRead?: boolean;

  constructor(recipientId: number, activityId: number, timestamp: number) {
    super();
    const self = this;
    self.recipientId = recipientId;
    self.activityId = activityId;
    self.timestamp = timestamp;
    assertValidNew(self);
  }

  async insertIntoDatabase(conn: Connection): Promise<void> {
    const self = this;
    assertValidNew(self);
    await self.insertIntoDatabaseAndRetrieveId(conn, INSERT_SQL, self);
  }
}

