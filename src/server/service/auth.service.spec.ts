import {assert} from 'chai';
import {authService} from "./auth.service";
import {UserModel} from "../models/user.model";
import {isValidObfuscatedIdFormat} from "./obfuscator.service";

describe('auth service', () => {
  it('should not expose sensitive information.', async () => {
    const user = new UserModel();
    user.id = 3;
    user.username = 'username';
    user.password = 'password';
    user.email = 'abc@123.com';
    user.role = 'admin';
    const token = await authService.sign(user);
    const p = await authService.verify(token);
    assert.isUndefined((p as any).password);
    assert.isTrue(isValidObfuscatedIdFormat(p.id));
  });
});
