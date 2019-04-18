import './env';
import bluebird from 'bluebird';

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
