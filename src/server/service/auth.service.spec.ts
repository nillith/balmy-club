import {assert} from 'chai';
import {authService} from "./auth.service";
import {$email, $username, UserRecord} from "../models/user.model";
import {isValidStringId} from "../../shared/utils";
import {$id} from "./obfuscator.service";

describe('auth service', () => {
  it('should not expose sensitive information.', async () => {
    const user = Object.create(UserRecord.prototype);
    user[$id] = 3;
    user[$username] = 'username';
    user[$email] = 'abc@123.com';
    user.role = 1;
    const token = await authService.sign(user);
    const p = await authService.verify(token);
    assert.isUndefined((p as any).password);
    assert.isTrue(isValidStringId(p.id));
  });
});
