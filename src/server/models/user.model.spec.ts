import {assert} from 'chai';
import {UserModel} from "./user.model";
import {MAX_USERNAME_LENGTH} from "../../shared/constants";
import {isValidStringId} from "../../shared/utils";
import {authService} from "../service/auth.service";
import {isValidPassword, isValidUsername} from "../../shared/utils";

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
    let user;
    beforeEach(() => {
      user = new UserModel();
      user.id = 10;
      user.username = 'username';
      user.password = 'password';
      user.email = 'abc@123.com';
      user.role = 'admin';
      return user;
    });


    it('should throw if user have no salt or hash', async () => {
      user.password = randomPassword();
      assert.throw(() => {
        user.verify(randomPassword());
      });

      await user.hashPassword();
      assert.throw(() => {
        user.salt = undefined;
        user.verify(randomPassword());
      });

      await user.hashPassword();
      assert.throw(() => {
        user.hash = undefined;
        user.verify(randomPassword());
      });
    });

    it('should return true for correct password', async () => {
      for (let i = 0; i < 10; ++i) {
        const password = user.password = randomPassword();
        await user.hashPassword();
        assert.isTrue(await user.verifyPassword(password), password);
      }
    });

    it('should return false for incorrect password', async () => {
      for (let i = 0; i < 10; ++i) {
        const password = user.password = randomPassword();
        const password2 = randomPassword();
        await user.hashPassword();
        assert.isFalse(await user.verifyPassword(password2), `${password}:${password2}`);
      }
    });

    it('should obfuscate id when JSON.stringify', () => {
      const str = JSON.stringify(user);
      assert.isString(str, typeof str);
      const clone = JSON.parse(str);
      assert.isObject(clone, typeof clone);
      assert.isDefined(clone.id);
      assert.isTrue(isValidStringId(clone.id), clone);
    });

    it('should not output sensitive info when JSON.stringify', async () => {
      await user.hashPassword();
      assert.isDefined(user.password);
      assert.isDefined(user.salt);
      assert.isDefined(user.hash);
      const clone = JSON.parse(JSON.stringify(user));
      assert.isUndefined(clone.password);
      assert.isUndefined(clone.salt);
      assert.isUndefined(clone.hash);
    });

    it('should be able to create user from jwt object literal', async () => {
      const token = await authService.sign(user);
      assert.isString(token, typeof token);
      const payload = await authService.verify(token);
      assert.notEqual(user.id, payload.id);
      assert.isTrue(isValidStringId(payload.id));
      assert.isObject(payload, typeof payload);
      const clone = UserModel.unObfuscateFrom(payload);
      assert.isDefined(clone);
      assert.strictEqual(user.id, clone!.id);
    });

    it('should not create a user from invalid object literal', async () => {
      const token = await authService.sign(user);
      assert.isString(token, typeof token);
      const payload = await authService.verify(token);
      assert.notEqual(user.id, payload.id);
      assert.isTrue(isValidStringId(payload.id));
      assert.isObject(payload, typeof payload);
      payload.id = '554d8f9e22022b23994ecff49b5033d1';
      const clone = UserModel.unObfuscateFrom(payload);
      assert.isUndefined(clone);
    });
  });
});
