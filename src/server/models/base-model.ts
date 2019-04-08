import {$id, $obfuscator, $toJsonFields} from '../constants/symbols';
import {UnsignedIntegerObfuscator} from "../service/obfuscator";
import {isSymbol} from "util";

export interface ToJsonField {
  from: string | symbol;
  to: string;
}

type ToJsonFields = ToJsonField[];


export const makeToJsonFields = function(fields: Array<string | symbol>): ToJsonFields {
  const toMap: any = {};
  return fields.map(from => {
    const to = isSymbol(from) ? (from as any).description : from;
    if (!to) {
      throw Error('Invalid ToJsonField');
    }
    if (toMap[to]) {
      throw Error(`Duplicate key: ${to}`);
    }
    toMap[to] = true;
    return {from, to};
  });
};

export const cloneByToJsonFields = function(obj: any, fields: ToJsonFields) {
  const result: any = {};
  for (const {from, to} of fields) {
    if (undefined !== obj[from]) {
      result[to] = obj[from];
    }
  }
  return result;
};

export const jsonStringifyByFields = function(obj: any, fields: ToJsonFields) {
  return JSON.stringify(cloneByToJsonFields(obj, fields));
};

export abstract class BaseModel {
  static [$toJsonFields]: ToJsonFields = [];
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
    return JSON.stringify(cloneByToJsonFields(self, self.constructor[$toJsonFields]));
  }
}
