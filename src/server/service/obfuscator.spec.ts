import {assert} from 'chai';
import {
  bufferToUnsignedInteger,
  circleObfuscator,
  postObfuscator,
  unsignedIntegerToBuffer,
  userObfuscator,
} from "./obfuscator";

function randomUnsigned(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

const obfuscators = [circleObfuscator, postObfuscator, userObfuscator,];

describe('obfuscator', () => {

  const applyCheck = function(check) {
    check(Number.MAX_SAFE_INTEGER);
    for (let i = 0; i < 100; ++i) {
      check(i);
      check(randomUnsigned());
    }
  };

  it('should return Buffer', () => {
    applyCheck(function(n: number) {
      assert.instanceOf(unsignedIntegerToBuffer(n), Buffer);
    });
  });

  it('should convert integer back', () => {
    applyCheck(function(n: number) {
      assert.strictEqual(n, bufferToUnsignedInteger(unsignedIntegerToBuffer(n)));
    });
  });

  const applyCheckToObfuscator = function(check) {
    applyCheck(function(n) {
      for (const obfuscator of obfuscators) {
        check(obfuscator, n);
      }
    });
  };

  it('should return 16 byte hex string', () => {
    applyCheckToObfuscator((obfuscator, n) => {
      assert.match(obfuscator.obfuscate(n), /^[0-9a-f]{32}$/);
    });
  });

  it('should unObfuscate back', () => {
    applyCheckToObfuscator((obfuscator, n) => {
      assert.strictEqual(n, obfuscator.unObfuscate(obfuscator.obfuscate(n)));
    });
  });
});
