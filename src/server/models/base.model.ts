import {$id, $obfuscator, $toJsonFields} from '../constants/symbols';
import {UnsignedIntegerObfuscator} from "../service/obfuscator.service";
import {isSymbol} from "util";

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

export abstract class BaseModel {
  static [$toJsonFields]: FieldMaps = [];
  id?: number | string;
  [$id]?: string;

  getObfuscator(): UnsignedIntegerObfuscator {
    return this.constructor[$obfuscator];
  }

  obfuscate() {
    const self = this;
    const obf = self.getObfuscator();
    if (self.id) {
      self[$id] = obf.obfuscate(self.id as number);
    }
  }

  toString() {
    throw Error('Not Allowed!');
  }

  toJSON() {
    const self = this;
    self.obfuscate();
    return cloneByFieldMaps(self, self.constructor[$toJsonFields]);
  }
}
