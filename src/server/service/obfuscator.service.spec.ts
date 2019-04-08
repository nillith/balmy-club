import {assert} from 'chai';
import {
  bufferToUnsignedInteger,
  circleObfuscator,
  isValidObfuscatedString,
  postObfuscator,
  unsignedIntegerToBuffer,
  userObfuscator,
} from "./obfuscator.service";

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

  it('should return validity of input string', () => {
    const invalidValues = [null, undefined, '', true, 333, 444.4,
      '3a2a2c20465685e1ed86dbfa8f649ce'];
    for (const v of invalidValues) {
      assert.isFalse(isValidObfuscatedString(v));
    }

    const validValues = [
      '19aeb21dddbd969565d7ed38bd896d97',
      'D9AE9894F5D41B34082FE79DE6DA4D1A',
      '26010cae2fb7e5ba19eaf10dbdf103fa',
    ];

    for (const v of validValues) {
      assert.isTrue(isValidObfuscatedString(v));
    }
  });

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

  it('should unObfuscate back UpperCase hex string', () => {
    applyCheckToObfuscator((obfuscator, n) => {
      assert.strictEqual(n, obfuscator.unObfuscate(obfuscator.obfuscate(n).toUpperCase()));
    });
  });

  it('should throw when obfuscate negative number', () => {
    assert.throw(function() {
      for (const obf of obfuscators) {
        obf.obfuscate(-1);
      }
    });
  });

  it('should return -1 when unobfuscate invalid input', () => {

    const invalidInput = [null, undefined, 1, 'daa948f1ab7b2d60c95507effb355f7a'];
    for (const obf of obfuscators) {
      for (const v of invalidInput) {
        assert.strictEqual(-1, obf.unObfuscate(v));
      }
    }
  });
});
