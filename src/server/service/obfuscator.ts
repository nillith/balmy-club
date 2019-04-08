import config from "../config/index";
import crypto from 'crypto';
const ALGORITHM = 'aes-256-ecb';
const HEX = 'HEX';
const RADIX = 16;

export const unsignedIntegerToBuffer = function(n: number): Buffer {
  let hexStr = n.toString(RADIX);
  if (hexStr.length & 1) {
    hexStr = '0' + hexStr;
  }
  return Buffer.from(hexStr, 'HEX');
};

export const bufferToUnsignedInteger = function(buf: Buffer): number {
  return parseInt(buf.toString('HEX'), RADIX);
};

const $key = Symbol();

class UnsignedIntegerObfuscator {

  constructor(key) {
    this[$key] = Buffer.from(key, HEX);
  }

  protected encrypt(plainBuffer: Buffer): Buffer {
    const cipher = crypto.createCipheriv(ALGORITHM, this[$key], '');
    return Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  }

  protected decrypt(cipherBuffer: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(ALGORITHM, this[$key], '');
    return Buffer.concat([decipher.update(cipherBuffer), decipher.final()]);
  }

  obfuscate(n: number): string {
    return this.encrypt(unsignedIntegerToBuffer(n)).toString(HEX);
  }

  unObfuscate(hexStr): number {
    return bufferToUnsignedInteger(this.decrypt(Buffer.from(hexStr, HEX)));
  }
}


export const userObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.user);
export const postObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.post);
export const circleObfuscator = new UnsignedIntegerObfuscator(config.secrets.obfuscator.circle);
