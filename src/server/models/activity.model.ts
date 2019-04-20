import {BulkInsertResult, DatabaseDriver, DatabaseRecordBase, fromDatabaseRow, insertReturnId} from "./model-base";
import {$contextExtraId, $contextId, $objectId, $subjectId} from "../service/obfuscator.service";
import {Activity} from "../../shared/interf";
import {isValidTimestamp} from "../../shared/utils";
import {devOnly, isNumericId} from "../utils/index";
import db from "../persistence/index";
import {NotificationRecord} from "./notification.model";


export class ActivityRecord extends DatabaseRecordBase {
  [$subjectId]: number;
  [$objectId]: number;
  objectType: number;
  actionType: number;
  timestamp: number;
  [$contextId]?: number;
  contextType?: number;
  [$contextExtraId]?: number;

  constructor(id: number, subjectId: number, objectId: number, objectType: number, actionType: number, timestamp: number, contextId?: number, contextType?: number) {
    super(id);
    this[$subjectId] = subjectId;
    this[$objectId] = objectId;
    this.objectType = objectType;
    this.actionType = actionType;
    this[$contextId] = contextId;
    this.contextType = contextType;
    this.timestamp = timestamp;
  }
}

export interface RawActivity {
  subjectId: number;
  objectId: number;
  objectType: number;
  actionType: number;
  timestamp: number;
  contextId?: number;
  contextType?: number;
}

export interface RawMentionActivities {
  mentionIds: number[];
  subjectId: number;
  timestamp: number;
  contextId: number;
  contextType: number;
}

export const assertValidRawMentionActivities = devOnly(function(data: any) {
  console.assert(isNumericId(data.subjectId), `invalid subjectId: ${data.subjectId}`);
  console.assert(isValidTimestamp(data.timestamp), `invalid timestamp: ${data.timestamp}`);
  console.assert(isNumericId(data.contextId), `invalid context id ${data.contextId}`);
  console.assert(Activity.isValidContextType(data.contextType), `invalid context type ${data.contextType}`);
});

// const rawMentionActivity = {
//   subjectId: commenter[$id],
//   objectId: m.id,
//   objectType: Activity.ObjectTypes.User,
//   actionType: Activity.UserActions.Mention,
//   timestamp,
// };

export const assertValidRawActivity = devOnly(function(data: any) {
  console.assert(isNumericId(data.subjectId), `invalid subjectId: ${data.subjectId}`);
  console.assert(isNumericId(data.objectId), `invalid objectId: ${data.objectId}`);
  console.assert(isValidTimestamp(data.timestamp), `invalid timestamp: ${data.timestamp}`);
  console.assert(Activity.isValidAction(data.objectType, data.actionType), `invalid action: type:${data.objectType}, action: ${data.actionType}`);
  const contextErrorMessage = `Invalid context: id:${data.contextId}, type:${data.contextType}`;
  console.assert(!!data.contextId === !!data.contextType, contextErrorMessage);
  if (data.contextId) {
    console.assert(isNumericId(data.contextId), `invalid context id ${data.contextId}`);
    console.assert(Activity.isValidContextType(data.contextType), `invalid context type ${data.contextType}`);
  }
  console.assert(Activity.isValidActivity(data.objectType, data.actionType, data.contextType), `invalid activity: objectType:${data.objectType}, actionType:${data.actionType}, contextType:${data.contextType}`);
});


const enum SQLs {
  INSERT = 'INSERT INTO Activities (subjectId, objectId, objectType, actionType, contextId, contextType, `timestamp`) VALUES (:subjectId, :objectId, :objectType, :actionType, :contextId, :contextType, :timestamp)',
  BULK_INSERT = 'INSERT INTO Activities (subjectId, objectId, objectType, actionType, contextId, contextType, `timestamp`) VALUES ?',
}

export class ActivityModel {

  static async insert(raw: RawActivity, drive: DatabaseDriver = db): Promise<number> {
    assertValidRawActivity(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }

  static async create(raw: RawActivity, drive: DatabaseDriver = db): Promise<ActivityRecord> {
    const id = await this.insert(raw, drive);
    const row = Object.create(raw);
    row.id = id;
    return fromDatabaseRow(row, ActivityRecord);
  }

  static async insertMentions(raw: RawMentionActivities, driver: DatabaseDriver = db): Promise<BulkInsertResult> {
    assertValidRawMentionActivities(raw);
    const {mentionIds, subjectId, timestamp, contextId, contextType} = raw;
    const objectType = Activity.ObjectTypes.User;
    const actionType = Activity.UserActions.Mention;
    const [result] = await driver.query(SQLs.BULK_INSERT as string, [mentionIds.map((mentionId) => {
      return [subjectId, mentionId, objectType, actionType, contextId, contextType, timestamp];
    })]);
    return result as BulkInsertResult;
  }
}
