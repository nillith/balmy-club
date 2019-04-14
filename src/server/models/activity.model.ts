import {ModelBase} from "./model-base";
import {$contextId, $objectId, $subjectId} from "../service/obfuscator.service";
import {Activity} from "../../shared/interf";
import {Connection} from 'mysql2/promise';
import {isValidTimestamp} from "../../shared/utils";
import {devOnly, isNumericId} from "../utils/index";


const assertValidNewModel = devOnly(function(model: ActivityModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isNumericId(model.subjectId), `invalid subjectId: ${model.subjectId}`);
  console.assert(isNumericId(model.objectId), `invalid objectId: ${model.objectId}`);
  console.assert(isValidTimestamp(model.timestamp), `invalid timestamp: ${model.timestamp}`);
  console.assert(Activity.isValidAction(model.objectType, model.actionType), `invalid action: type:${model.objectType}, action: ${model.actionType}`);
  const contextErrorMessage = `Invalid context: id:${model.contextId}, type:${model.contextType}`;
  console.assert(!!model.contextId === !!model.contextType, contextErrorMessage);
  if (model.contextId) {
    console.assert(isNumericId(model.contextId), `invalid context id ${model.contextId}`);
    console.assert(Activity.isValidContextType(model.contextType), `invalid context type ${model.contextType}`);
  }
  console.assert(Activity.isValidActivity(model.objectType, model.actionType, model.contextType), `invalid activity: objectType:${model.objectType}, actionType:${model.actionType}, contextType:${model.contextType}`);
});


const INSERT_SQL = 'INSERT INTO `Activities` (subjectId, objectId, objectType, actionType, contextId, contextType, `timestamp`) VALUES (:subjectId, :objectId, :objectType, :actionType, :contextId, :contextType, `:timestamp`)';

export class ActivityModel extends ModelBase {
  subjectId?: number | string;
  [$subjectId]?: string;
  objectId?: number | string;
  [$objectId]?: string;
  objectType?: number;
  actionType?: number;
  [$contextId]?: string;
  contextId?: number | string;
  contextType?: number;
  timestamp?: number;

  constructor(subjectId: number, objectId: number, objectType: number, actionType: number, timestamp: number, contextId?: number, contextType?: number) {
    super();
    const self = this;
    self.subjectId = subjectId;
    self.objectId = objectId;
    self.objectType = objectType;
    self.actionType = actionType;
    self.timestamp = timestamp;
    self.contextId = contextId;
    self.contextType = contextType;
    assertValidNewModel(self);
  }


  async insertIntoDatabase(conn: Connection): Promise<void> {
    const self = this;
    assertValidNewModel(self);
    await self.insertIntoDatabaseAndRetrieveId(conn, INSERT_SQL, self);
  }
}
