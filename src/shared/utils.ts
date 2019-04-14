import {CIRCLE_NAME_PATTERN, MAX_POST_LENGTH} from "./constants";

export const noop = function(...args: any[]): any {
};

export const identity = function <T>(t: T): T {
  return t;
};

export const utcTimestamp = function() {
  return Math.floor(Date.now() / 1000);
};

export const timeOfDay = function() {
  return new Date().toISOString().substr(11, 12);
};

export const isValidPostContent = function(content?: string) {
  return !!content && content.length < MAX_POST_LENGTH;
};

export function isValidTimestamp(t?: number | string) {
  return !!t && /^[0-9]{10}$/.test(String(t));
}

export function cloneFields(obj: any, fields: string[]) {
  const result: any = {};
  for (const field of fields) {
    if (undefined !== obj[field]) {
      result[field] = obj[field];
    }
  }
  return result;
}

export const makeInstance = function <T>(obj: object, t: { new(...arg: any[]): T }): T {
  return Object.setPrototypeOf(obj, t.prototype) as T;
};

export const patternCheckFun = function(pattern) {
  return function(arg: string): boolean {
    return !!arg && RegExp(`^${pattern}$`).test(arg);
  };
};

export const isValidCircleName = patternCheckFun(CIRCLE_NAME_PATTERN);
