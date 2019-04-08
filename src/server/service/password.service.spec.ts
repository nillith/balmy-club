import {assert} from 'chai';
import passwordService from "./password.service";

const randomPassword = (function() {
  function gen() {
    return Math.random().toString(36).substr(2);
  }

  return function() {
    return gen() + gen();
  };
})();

describe('auth service', () => {
  it('should return true for correct password', async () => {
    for (let i = 0; i < 10; ++i) {
      const password = randomPassword();
      const salt = await passwordService.generateSalt();
      const hash = await passwordService.passwordHash(salt, password);
      assert.isTrue(await passwordService.verifyPassword(salt, hash, password), password);
    }
  });

  it('should return false for incorrect password', async () => {
    for (let i = 0; i < 10; ++i) {
      const password = randomPassword();
      const password2 = randomPassword();
      const salt = await passwordService.generateSalt();
      const hash = await passwordService.passwordHash(salt, password);
      assert.isFalse(await passwordService.verifyPassword(salt, hash, password2), `${password}:${password2}`);
    }
  });
});
