import {assert} from 'chai';
import {isValidPassword, isValidUsername} from "./user";
import {maxUsernameLength, minPasswordLength} from "../../shared/constants";

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
    assert.isFalse(isValidUsername('short'));
    assert.isFalse(isValidUsername('1blah'));
    assert.isFalse(isValidUsername('aoetu+anosteu'));
    assert.isFalse(isValidUsername('aoetu)(*&%]anosteu'));
    assert.isFalse(isValidUsername('a'.repeat(maxUsernameLength + 1)));
  });

  it('should return true for valid username', () => {
    assert.isTrue(isValidUsername('a'.repeat(maxUsernameLength)));
    assert.isTrue(isValidUsername('123321'));
    assert.isTrue(isValidUsername('bla_h.bl-ah'));
    assert.isTrue(isValidUsername('$blah33'));
    assert.isTrue(isValidUsername('ab@123.com'));
    assert.isTrue(isValidUsername('abc.efg@123.com'));
  });
});
