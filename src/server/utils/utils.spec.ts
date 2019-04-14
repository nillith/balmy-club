import {assert} from 'chai';
import {devOnly, getNoop, isAsyncFunction, isNumericId} from "./index";
import {noop} from "../../shared/utils";


describe('Server.Utils', () => {
  it('should return true for async function', () => {
    assert.isTrue(isAsyncFunction(async () => {
    }));

    assert.isTrue(isAsyncFunction(async function() {
    }));
  });

  it('should return true for async function', () => {
    assert.isFalse(isAsyncFunction(() => {
    }));

    assert.isFalse(isAsyncFunction(function() {
    }));
  });

  it('should return noop', () => {
    const originalFunction = () => {
      throw Error('blah');
    };
    const noopFunction = getNoop(originalFunction);
    assert.strictEqual(noopFunction, noop);
  });

  it('should return original in dev', () => {
    const originalFunction = () => {
    };
    const devOnlyFunction = devOnly(originalFunction);
    assert.strictEqual(originalFunction, devOnlyFunction);
  });

  it('should return true for numeric id', () => {
    assert.isTrue(isNumericId(1));
    assert.isTrue(isNumericId(2));
    assert.isTrue(isNumericId(3));
    assert.isTrue(isNumericId(Number.MAX_SAFE_INTEGER));
  });

  it('should return false for non numeric id', () => {
    assert.isFalse(isNumericId());
    assert.isFalse(isNumericId(null));
    assert.isFalse(isNumericId(''));
    assert.isFalse(isNumericId(0));
    assert.isFalse(isNumericId(-1));
    assert.isFalse(isNumericId(1.00001));
  });
});
