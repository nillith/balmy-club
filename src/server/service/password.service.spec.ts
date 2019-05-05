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
      const salt = passwordService.generateSalt();
      const hash = await passwordService.passwordHash(salt, password);
      assert.isTrue(await passwordService.verifyPassword(password, salt, hash), password);
    }
  });

  it('should return false for incorrect password', async () => {
    for (let i = 0; i < 10; ++i) {
      const password = randomPassword();
      const password2 = randomPassword();
      const salt = await passwordService.generateSalt();
      const hash = await passwordService.passwordHash(salt, password);
      assert.isFalse(await passwordService.verifyPassword(password2, salt, hash), `${password}:${password2}`);
    }
  });
});
