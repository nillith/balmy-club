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


process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });
