import {$id, $outboundFields} from '../service/obfuscator.service';
import {isNumber, isSymbol} from "util";
import {Connection, Pool} from 'mysql2/promise';
import {OutboundData} from "../init";


export type DatabaseDriver = Connection | Pool;

export interface FieldMap {
  from: string | symbol;
  to: string;
}

type FieldMaps = FieldMap[];


export const makeFieldMaps = function(fields: Array<string | symbol>): FieldMaps {
  const toMap: any = {};
  return fields.map(from => {
    const to = isSymbol(from) ? (from as any).description : from;
    if (!to) {
      throw Error('Invalid FieldMap');
    }
    if (toMap[to]) {
      throw Error(`Duplicate key: ${to}`);
    }
    toMap[to] = true;
    return {from, to};
  });
};

export const cloneByFieldMaps = function(obj: any, fields: FieldMaps) {
  const result: any = {};
  for (const {from, to} of fields) {
    if (undefined !== obj[from]) {
      result[to] = obj[from];
    }
  }
  return result;
};

export const jsonStringifyByFields = function(obj: any, fields: FieldMaps) {
  return JSON.stringify(cloneByFieldMaps(obj, fields));
};


export abstract class ModelBase extends OutboundData {
  id?: number | string;
  [$id]?: string;

  isNew() {
    return !this.id;
  }

  obfuscate() {
    throw Error('Not implemented');
  }

  getOutboundData(): any {
    const self = this;
    self.obfuscate();
    return cloneByFieldMaps(self, self.constructor[$outboundFields]);
  }

  protected async insertIntoDatabaseAndRetrieveId(driver: DatabaseDriver, sql: string, replacements: any): Promise<void> {
    const [result] = await driver.query(sql, replacements);
    this.id = (result as any).insertId;
    console.assert(isNumber(this.id));
  }
}
