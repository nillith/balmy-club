import config from "../config/index";
import crypto from 'crypto';
import {makeInstance} from "../utils/index";
import {isString} from "util";

const ALGORITHM = 'aes-256-ecb';
const HEX = 'HEX';
const RADIX = 16;

export const unsignedIntegerToBuffer = function(n: number): Buffer {
  let hexStr = n.toString(RADIX);
  if (hexStr.length & 1) {
    hexStr = '0' + hexStr;
  }
  return Buffer.from(hexStr, 'HEX');
};

export const bufferToUnsignedInteger = function(buf: Buffer): number {
  return parseInt(buf.toString('HEX'), RADIX);
};

export const isValidObfuscatedIdFormat = function(str: any): boolean {
  return !!str && 32 === str.length && /^[0-9a-fA-F]{32}$/.test(str);
};

const $key = Symbol();

export const INVALID_NUMERIC_ID = -1;

export class UnsignedIntegerObfuscator {
  constructor(key) {
    this[$key] = Buffer.from(key, HEX);
  }

  protected encrypt(plainBuffer: Buffer): Buffer {
    const cipher = crypto.createCipheriv(ALGORITHM, this[$key], '');
    return Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  }

  protected decrypt(cipherBuffer: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(ALGORITHM, this[$key], '');
    return Buffer.concat([decipher.update(cipherBuffer), decipher.final()]);
  }

  obfuscate(n: number): string {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('unsigned integer required!');
    }
    return this.encrypt(unsignedIntegerToBuffer(n)).toString(HEX);
  }

  unObfuscate(hexStr): number {
    if (!isValidObfuscatedIdFormat(hexStr)) {
      return INVALID_NUMERIC_ID;
    }
    try {
      return bufferToUnsignedInteger(this.decrypt(Buffer.from(hexStr, HEX)));
    } catch (e) {
      return INVALID_NUMERIC_ID;
    }
  }
}

export class BatchObfuscator {
  constructor(private obfuscator: UnsignedIntegerObfuscator) {

  }

  obfuscate(arr: number[]): string[] {
    const {obfuscator} = this;
    return arr.map((n) => {
      return obfuscator.obfuscate(n);
    });
  }

  unObfuscate(arr: string[]): number[] {
    const {obfuscator} = this;
    return arr.map((hex) => {
      return obfuscator.unObfuscate(hex);
    }).filter((n) => INVALID_NUMERIC_ID !== n);
  }
}

export const userObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.user);
export const postObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.post);
export const commentObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.comment);
export const circleObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.circle);
export const batchCircleObfuscator = new BatchObfuscator(circleObfuscator);

export class IdNameObfuscatorMap {
  name: string;

  constructor(public symbol: symbol, public obfuscator: any) {
    this.name = (symbol as any).description;
    if (!this.name) {
      throw Error('Invalid argument: symbol must have description!');
    }
  }
}

const haveDuplicateIdNameObfuscatorMap = function(maps: IdNameObfuscatorMap[]) {
  const existingKey = {};
  for (const {name, symbol} of maps) {
    if (existingKey[name] || existingKey[symbol]) {
      return true;
    }
    existingKey[name] = name;
    existingKey[symbol] = symbol;
  }
  return false;
};

export const obfuscatorFuns = function <T>(maps: IdNameObfuscatorMap[], t: { new(...arg: any[]): T }) {
  if (haveDuplicateIdNameObfuscatorMap(maps)) {
    throw Error("DuplicateIdNameObfuscatorMap");
  }

  const unObfuscateFrom = function(obj: object): T | undefined {
    if (!obj) {
      return;
    }

    for (const {name, obfuscator} of maps) {
      const v = obj[name];
      if (v) {
        const id = obfuscator.unObfuscate(v);
        if (INVALID_NUMERIC_ID === id) {
          return;
        }
        obj[name] = id;
      }
    }

    return makeInstance(obj, t);
  };

  const obfuscate = function(this: T) {
    for (const {name, symbol, obfuscator} of maps) {
      const v = this[name];
      if (v) {
        this[symbol] = obfuscator.obfuscate(v);
      }
    }
  };

  return {
    unObfuscateFrom,
    obfuscate
  };
};

export const $toJsonFields = Symbol();
export const $obfuscator = Symbol();
export const $id = Symbol('id');
export const $postId = Symbol('$postId');
export const $authorId = Symbol('authorId');
export const $ownerId = Symbol('ownerId');
export const $circleId = Symbol('circleId');
export const $userId = Symbol('userId');
export const $reShareFromPostId = Symbol('reShareFromPostId');
export const $subjectId = Symbol('subjectId');
export const $objectId = Symbol('objectId');
export const $visibleCircleIds = Symbol('visibleCircleIds');
export const $contextId = Symbol('contextId');
export const $mentionIds = Symbol('mentionIds');
export const $recipientId = Symbol('recipientId');
export const $activityId = Symbol('activityId');


const ID_USER = new IdNameObfuscatorMap($id, userObfuscator);
const AUTHOR_ID = new IdNameObfuscatorMap($authorId, userObfuscator);
const USER_ID = new IdNameObfuscatorMap($userId, userObfuscator);
const OWNER_ID = new IdNameObfuscatorMap($ownerId, userObfuscator);
const ID_POST = new IdNameObfuscatorMap($id, postObfuscator);
const POST_ID = new IdNameObfuscatorMap($postId, postObfuscator);
const RE_SHARE_FROM_POST_ID = new IdNameObfuscatorMap($reShareFromPostId, postObfuscator);
const ID_COMMENT = new IdNameObfuscatorMap($id, commentObfuscator);
const ID_CIRCLE = new IdNameObfuscatorMap($id, circleObfuscator);
const CIRCLE_ID = new IdNameObfuscatorMap($circleId, circleObfuscator);
const SHARE_CIRCLE_IDS = new IdNameObfuscatorMap($visibleCircleIds, batchCircleObfuscator);

export const USER_OBFUSCATE_MAPS = [ID_USER];
export const POST_OBFUSCATE_MAPS = [ID_POST, AUTHOR_ID, RE_SHARE_FROM_POST_ID, SHARE_CIRCLE_IDS];
export const COMMENT_OBFUSCATE_MAPS = [ID_COMMENT, POST_ID, AUTHOR_ID];
export const CIRCLE_OBFUSCATE_MAPS = [ID_CIRCLE, OWNER_ID];


export interface JsonFieldMap {
  from: string | symbol;
  to: string;
}

type JsonFieldMaps = JsonFieldMap[];


export const makeJsonFieldMaps = function(fields: Array<string | IdNameObfuscatorMap>): JsonFieldMaps {
  const fromKeys = {};
  const toKeys = {};
  return fields.map(field => {
    let to: string;
    let from: string | symbol;
    if (isString(field)) {
      to = field;
      from = field;
    } else {
      to = field.name;
      from = field.symbol;
    }
    if (!to) {
      throw Error('Invalid FieldMap');
    }
    if (fromKeys[from]) {
      throw Error(`Duplicate from key:  ${String(from)}`);
    }
    fromKeys[from] = true;
    if (toKeys[to]) {
      throw Error(`Duplicate to key: ${to}`);
    }
    toKeys[to] = true;
    return {from, to};
  });
};


export const cloneByJsonFieldMaps = function(obj: any, fields: JsonFieldMaps) {
  const result: any = {};
  for (const {from, to} of fields) {
    if (undefined !== obj[from]) {
      result[to] = obj[from];
    }
  }
  return result;
};

export const stringifyByJsonFieldMaps = function(obj: any, fields: JsonFieldMaps) {
  return JSON.stringify(cloneByJsonFieldMaps(obj, fields));
};

