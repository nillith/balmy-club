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
    const self = this;
    const result: any = {};
    cloneFields(self, self.constructor[$outboundCloneFields], result);
    self.obfuscateCloneTo(result);
    return result;
  }

  assign(from: any) {
    const self = this;
    cloneFields(from, self.constructor[$outboundCloneFields], self);
    self.hideCloneFrom(from);
  }

  unObfuscateAssign(from: any) {
    const self = this;
    cloneFields(from, self.constructor[$outboundCloneFields], self);
    self.unObfuscateCloneFrom(from);
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
