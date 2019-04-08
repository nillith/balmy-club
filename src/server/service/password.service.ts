import crypto from 'crypto';
import config from '../config';

export class PasswordOptions {
  constructor(readonly saltBytes: number,
              readonly keyBytes: number,
              readonly iterations: number,
              readonly algorithm: string) {
  }
}

class PasswordService extends PasswordOptions {
  constructor(options: PasswordOptions) {
    super(options.saltBytes, options.keyBytes, options.iterations, options.algorithm)
  }

  async generateSalt(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      crypto.randomBytes(this.saltBytes, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          resolve(salt);
        }
      });
    });
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
}

const passwordService = new PasswordService(config.password);

export default passwordService;