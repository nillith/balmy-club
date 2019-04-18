import {assert} from 'chai';
import {$email, $hash, $salt, $username, UserModel, UserRecord} from "./user.model";
import {MAX_USERNAME_LENGTH} from "../../shared/constants";
import {isValidPassword, isValidStringId, isValidUsername} from "../../shared/utils";
import {authService} from "../service/auth.service";
import {$id} from "../service/obfuscator.service";

const randomPassword = (function() {
  function gen() {
    return Math.random().toString(36).substr(2);
  }

  return function() {
    return gen() + gen();
  };
})();


describe('user', () => {

  it('should return false for invalid password', () => {
    assert.isFalse(isValidPassword('1'));
    assert.isFalse(isValidPassword('@'));
    assert.isFalse(isValidPassword('#$'));
    assert.isFalse(isValidPassword('12'));
    assert.isFalse(isValidPassword('123'));
  });

  it('should return true for valid password', () => {
    assert.isTrue(isValidPassword('12345678910111213'));
    assert.isTrue(isValidPassword('@,12345678910111213'));
    assert.isTrue(isValidPassword('@,$%^&^%*^#@EOEAOEU3'));
  });

  it('should return false for invalid username', () => {
    assert.isFalse(isValidUsername('1'));
    assert.isFalse(isValidUsername('shrt'));
    assert.isFalse(isValidUsername('1blh'));
    assert.isFalse(isValidUsername('aoetu+anosteu'));
    assert.isFalse(isValidUsername('aoetu)(*&%]anosteu'));
    assert.isFalse(isValidUsername('a'.repeat(MAX_USERNAME_LENGTH + 1)));
  });

  it('should return true for valid username', () => {
    assert.isTrue(isValidUsername('a'.repeat(MAX_USERNAME_LENGTH)));
    assert.isTrue(isValidUsername('123321'));
    assert.isTrue(isValidUsername('bla_h.bl-ah'));
    assert.isTrue(isValidUsername('$blah33'));
    assert.isTrue(isValidUsername('ab@123.com'));
    assert.isTrue(isValidUsername('abc.efg@123.com'));
  });


  describe('UserModel', () => {
    let user: UserRecord;
    beforeEach(() => {
      user = Object.create(UserRecord.prototype);
      user[$id] = 10;
      user[$username] = 'username';
      user[$email] = 'abc@123.com';
      user.role = 1;
      return user;
    });


    it('should throw if user have no salt and hash', async () => {
      let err;
      try {
        await user.verifyPassword(randomPassword());
      } catch (e) {
        err = e;
      }
      assert.isDefined(err);
    });

    it('should throw if user have no salt', async () => {
      let err;
      try {
        await user.hashPassword(randomPassword());
      } catch (e) {
        err = e;
      }
      assert.isUndefined(err);

      try {
        user[$salt] = undefined;
        await user.verifyPassword(randomPassword());
      } catch (e) {
        err = e;
      }
      assert.isDefined(err);
    });

    it('should throw if user have no hash', async () => {
      let err;
      try {
        await user.hashPassword(randomPassword());
      } catch (e) {
        err = e;
      }
      assert.isUndefined(err);

      try {
        user[$hash] = undefined;
        await user.verifyPassword(randomPassword());
      } catch (e) {
        err = e;
      }
      assert.isDefined(err);
    });

    it('should return true for correct password', async () => {
      for (let i = 0; i < 10; ++i) {
        const password = randomPassword();
        await user.hashPassword(password);
        assert.isTrue(await user.verifyPassword(password), password);
      }
    });

    it('should return false for incorrect password', async () => {
      for (let i = 0; i < 10; ++i) {
        const password = randomPassword();
        const password2 = randomPassword();
        await user.hashPassword(password);
        assert.isFalse(await user.verifyPassword(password2), `${password}:${password2}`);
      }
    });

    it('should obfuscate id ', () => {
      const data = JSON.parse(JSON.stringify(user));
      assert.isObject(data, typeof data);
      assert.isDefined(data.id);
      assert.isTrue(isValidStringId(data.id), data);
    });

    it('should not output sensitive info when JSON.stringify', async () => {
      await user.hashPassword(randomPassword());
      assert.isDefined(user[$salt]);
      assert.isDefined(user[$hash]);
      const data = JSON.parse(JSON.stringify(user));
      assert.isUndefined(data[$salt]);
      assert.isUndefined(data[$hash]);
      assert.isUndefined(data.password);
      assert.isUndefined(data.salt);
      assert.isUndefined(data.hash);
    });

    it('should be able to create user from jwt object literal', async () => {
      const token = await authService.sign(user);
      assert.isString(token, typeof token);
      const payload = await authService.verify(token);
      console.log(typeof payload);
      assert.notEqual(user[$id], payload.id as any);
      assert.isTrue(isValidStringId(payload.id));
      assert.isObject(payload, typeof payload);
      const data = Object.create(UserRecord.prototype);
      data.unObfuscateAssign(payload);
      assert.isDefined(data);
      assert.isDefined(data[$id]);
      assert.strictEqual(user[$id], data[$id]);
    });

    it('should not create a user from invalid object literal', async () => {
      const token = await authService.sign(user);
      assert.isString(token, typeof token);
      const payload = await authService.verify(token);
      assert.notEqual(user[$id], payload.id as any);
      assert.isTrue(isValidStringId(payload.id));
      assert.isObject(payload, typeof payload);
      payload.id = '554d8f9e22022b23994ecff49b5033d1';
      const data = Object.create(UserRecord.prototype);
      data.unObfuscateAssign(payload);
      assert.isUndefined(data[$id]);
    });
  });
});
