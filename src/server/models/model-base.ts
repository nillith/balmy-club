import {$id, $outboundCloneFields} from '../service/obfuscator.service';
import {Connection, Pool} from 'mysql2/promise';
import {devOnly, isNumericId} from "../utils/index";
import {cloneFields} from "../../shared/utils";


export type DatabaseDriver = Connection | Pool;

export interface Observer {
  observerId: number;
}

export interface Observation extends Observer {
  targetId: number;
}

export const assertValidObservation = devOnly(function(data: any) {
  console.assert(isNumericId(data.targetId), `invalid targetId: ${data.targetId}`);
  console.assert(isNumericId(data.observerId), `invalid targetId: ${data.observerId}`);
});

export const assertValidId = devOnly(function(id: any) {
  console.assert(isNumericId(id), `invalid id: ${id}`);
});

export interface BulkInsertResult {
  insertId: number;
  affectedRows: number;
}

export function bulkInsertIds(insertResult: BulkInsertResult): number[] {
  const {insertId, affectedRows} = insertResult;
  const result: number[] = [insertId];
  for (let i = 1; i < affectedRows; ++i) {
    result.push(insertId + i);
  }
  return result;
}

export class DatabaseRecordBase {
  static readonly [$outboundCloneFields]: string[] = [];
  [$id]: number;

  constructor(id: number) {
    this[$id] = id;
  }

  unObfuscateCloneFrom(obj: any): void {
    throw Error('Not Implemented!');
  }

  obfuscateCloneTo(obj: any): void {
    throw Error('Not Implemented!');
  }

  hideCloneFrom(obj: any): void {
    throw Error('Not Implemented!');
  }

  toJSON(): any {
    const _this = this;
    const result: any = {};
    cloneFields(_this, _this.constructor[$outboundCloneFields], result);
    _this.obfuscateCloneTo(result);
    return result;
  }

  assign(from: any) {
    const _this = this;
    cloneFields(from, _this.constructor[$outboundCloneFields], _this);
    _this.hideCloneFrom(from);
  }

  unObfuscateAssign(from: any) {
    const _this = this;
    cloneFields(from, _this.constructor[$outboundCloneFields], _this);
    _this.unObfuscateCloneFrom(from);
  }
}

(DatabaseRecordBase as any)[$outboundCloneFields] = null;

export async function insertReturnId(sql: string, replacements: any, driver: DatabaseDriver): Promise<number> {
  const [result] = await driver.query(sql, replacements);
  return (result as any).insertId;
}

export const fromDatabaseRow = function <T extends DatabaseRecordBase>(row: any, t: { new(...arg: any[]): T }): T {
  const result = Object.create(t.prototype);
  result.assign(row);
  return result;
};

export function updateOneSucceed(queryResult: any): boolean {
  return queryResult.affectedRows === 1;
}
