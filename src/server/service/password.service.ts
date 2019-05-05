import crypto from 'crypto';
import config from '../config';
import {isValidPassword} from "../../shared/utils";

export class PasswordOptions {
  constructor(readonly saltBytes: number,
              readonly keyBytes: number,
              readonly iterations: number,
              readonly algorithm: string) {
  }
}

class PasswordService extends PasswordOptions {
  constructor(options: PasswordOptions) {
    super(options.saltBytes, options.keyBytes, options.iterations, options.algorithm);
  }

  generateSalt(): Buffer {
    return crypto.randomBytes(this.saltBytes);
  }

  async passwordHash(salt: Buffer, pass: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(pass, salt, this.iterations, this.keyBytes, this.algorithm, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key);
        }
      });
    });
  }

  async verifyPassword(password: string, salt: Buffer, hash: Buffer): Promise<boolean> {
    return isValidPassword(password) && hash.equals(await passwordService.passwordHash(salt, password));
  }
}

const passwordService = new PasswordService(config.password);

export default passwordService;
