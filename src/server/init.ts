import './env';
import bluebird from 'bluebird';
import {response, Response} from "express";

global.Promise = bluebird;
const DESCRIPTION = 'description';
if (!(Symbol.prototype as any)[DESCRIPTION]) {
  Object.defineProperty(Symbol.prototype, DESCRIPTION, {
    get() {
      return this.toString().match(/^Symbol\((.*)\)$/)[1];
    }, set: undefined, enumerable: false, configurable: true
  });
}

console.assert = function(v: boolean, msg?: string) {
  if (!v) {
    throw Error(msg || "MyAssertion failed!");
  }
};


export abstract class OutboundData {
  toJSON() {
    throw Error('toJSON is not allowed!');
  }

  abstract getOutboundData(): any;
}

export class OutboundDataHolder {
  getOutboundData(): any {
    return this.data;
  }

  constructor(private data: any) {
  }
}

export const respondWithJson = (() => {
  const $json = Symbol();
  const oldJson = response.json;
  response.json = function() {
    throw Error(`res.json is not allowed, use respondWithJson instead!`);
  };
  response[$json] = oldJson;

  return function(res: Response, data: { getOutboundData(): any; }, code = 200) {
    res.status(code)[$json](data.getOutboundData());
  };
})();


// process
//   .on('unhandledRejection', (reason, p) => {
//     console.error(reason, 'Unhandled Rejection at Promise', p);
//   })
//   .on('uncaughtException', err => {
//     console.error(err, 'Uncaught Exception thrown');
//     process.exit(1);
//   });
