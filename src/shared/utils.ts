import {
  CIRCLE_NAME_PATTERN,
  EMAIL_ADDRESS_PATTERN,
  MAX_POST_LENGTH,
  MIN_PASSWORD_LENGTH,
  NICKNAME_PATTERN,
  USERNAME_PATTERN
} from "./constants";

export const noop = function(...args: any[]): any {
};

export const identity = function <T>(t: T): T {
  return t;
};

export const returnThis = function(this: any) {
  return this;
};

export const utcTimestamp = function() {
  return Math.floor(Date.now() / 1000);
};

export const timeOfDay = function() {
  return new Date().toISOString().substr(11, 12);
};

export const localeTimeOfDay = function() {
  const date = new Date();
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const mill = date.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${mill}`;
};

export const isValidPostContent = function(content?: string) {
  return !!content && content.length < MAX_POST_LENGTH;
};

export function isValidTimestamp(t?: number | string) {
  return !!t && /^[0-9]{10}$/.test(String(t));
}

export function cloneFields(obj: any, fields: string[], target: any = {}) {
  for (const field of fields) {
    if (undefined !== obj[field]) {
      target[field] = obj[field];
    }
  }
  return target;
}

export const makeInstance = function <T>(obj: object, t: { new(...arg: any[]): T }): T {
  return Object.setPrototypeOf(obj, t.prototype) as T;
};

export const patternCheckFun = function(pattern) {
  return function(arg?: string): boolean {
    return !!arg && RegExp(`^${pattern}$`).test(arg);
  };
};

export const isValidCircleName = patternCheckFun(CIRCLE_NAME_PATTERN);

export const isValidEmailAddress = patternCheckFun(EMAIL_ADDRESS_PATTERN);

export const isValidUsername = patternCheckFun(USERNAME_PATTERN);

export const isValidNickname = patternCheckFun(NICKNAME_PATTERN);

export const isValidPassword = function(password: string | undefined): boolean {
  return !!password && password.length >= MIN_PASSWORD_LENGTH;
};
export const isValidStringId = function(str: any): boolean {
  return !!str && 32 === str.length && /^[0-9a-fA-F]{32}$/.test(str);
};
