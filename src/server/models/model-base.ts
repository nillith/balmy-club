import {$id, $toJsonFields} from '../service/obfuscator.service';
import {isNumber, isSymbol} from "util";
import {Connection} from 'mysql2/promise';

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

export abstract class ModelBase {
  static unObfuscateFrom(obj: any): any {
    throw Error('Not implemented');
  }

  id?: number | string;
  [$id]?: string;

  isNew() {
    return !this.id;
  }

  obfuscate() {
    throw Error('Not implemented');
  }

  toString() {
    throw Error('Not Allowed!');
  }

  toJSON() {
    const self = this;
    self.obfuscate();
    return cloneByFieldMaps(self, self.constructor[$toJsonFields]);
  }

  protected async insertIntoDatabaseAndRetrieveId(conn: Connection, sql: string, replacements: any): Promise<void> {
    const [result] = await conn.query(sql, replacements);
    this.id = (result as any).insertId;
    console.assert(isNumber(this.id));
  }

}
