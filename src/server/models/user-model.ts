import db from '../persistence';
import passwordService from '../service/password';
import {BaseModel, makeToJsonFields} from "./base-model";
import {$id, $obfuscator, $toJsonFields} from "../constants/symbols";
import {maxUsernameLength, minPasswordLength, usernamePattern} from "../../shared/constants";
import {InvalidResult, isValidObfuscatedString, userObfuscator} from "../service/obfuscator";
import {JwtSignable} from "../service/auth";
import {makeInstance} from "../utils/index";
import {isNumber, isString} from "util";

export const isValidUsername = function(username: string): boolean {
  return !!username && RegExp(usernamePattern).test(username) && Buffer.byteLength(username) <= maxUsernameLength;
};

export const isValidPassword = function(password: string): boolean {
  return !!password && Buffer.byteLength(password) >= minPasswordLength;
};

export interface UserCreateInfo {
  username: string;
  password: string;
  email: string;
  role?: string;
}

export class UserModel extends BaseModel implements JwtSignable {
  static readonly [$toJsonFields] = makeToJsonFields([
    $id,
    'username',
    'email',
    'role'
  ]);

  static readonly [$obfuscator] = userObfuscator;

  role?: string;
  hash?: Buffer;
  salt?: Buffer;
  username?: string;
  password?: string;
  email?: string;

  static from(obj: object): UserModel | undefined {
    if (!obj) {
      return;
    }
    const result = makeInstance(obj, UserModel);
    if (isString(result.id) && isValidObfuscatedString(result.id)) {
      result.id = userObfuscator.unObfuscate(result.id);
      if (result.id === InvalidResult) {
        return;
      }
    }
    return result;
  }

  static async create(body: UserCreateInfo): Promise<UserModel> {
    const user = UserModel.from({
      email: body.email,
      username: body.username,
      password: body.password,
      role: body.role || 'user'
    }) as UserModel;
    await user.hashPassword();
    const [result] = await db.query(`INSERT INTO Users (username, email, role, salt, hash) VALUES(:username, :email, :role, :salt, :hash)`, user);
    user.id = (result as any).insertId;
    console.assert(isNumber(user.id));
    return user;
  }

  static async emailUsed(email: string): Promise<boolean> {
    const [rows] = await db.query(`SELECT id FROM Users WHERE email = :email LIMIT 1`, {email});
    return !!rows && !!(rows as any).length;
  }

  static async findById(id: number | string): Promise<UserModel | undefined> {
    const [rows] = await db.query('SELECT * FROM Users WHERE id = :id', {id});
    if (rows && (rows as any).length) {
      return UserModel.from(rows[0]) as UserModel;
    }
  }

  static async authenticate(userName: string, password: string): Promise<UserModel | undefined> {
    const [rows] = await db.query(`SELECT username, salt, hash FROM Users WHERE userName = :userName LIMIT 1`, {userName});
    if (rows && (rows as any).length) {
      const user = UserModel.from(rows[0]) as UserModel;
      if (await user!.verifyPassword(password)) {
        return user;
      }
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return isValidPassword(password) && this.hash!.equals(await passwordService.passwordHash(this.salt!, password));
  }

  async hashPassword() {
    this.salt = await passwordService.generateSalt();
    this.hash = await passwordService.passwordHash(this.salt, this.password!);
  }

  async changePassword(password: string) {
    this.password = password;
    await this.hashPassword();
    await db.execute(`UPDATE Users SET salt = :salt, hash = :hash WHERE id = :id`, this);
  }

  getJwtPayload(): string | Buffer | Object {
    return JSON.stringify(this);
  }
}
