import db from '../persistence';
import passwordService from '../service/password.service';
import {BaseModel, cloneByFieldMaps, makeFieldMaps} from "./base.model";
import {$id, $obfuscator, $toJsonFields} from "../constants/symbols";
import {maxUsernameLength, minPasswordLength, Roles, usernamePattern, UserRanks} from "../../shared/constants";
import {InvalidResult, isValidObfuscatedString, userObfuscator} from "../service/obfuscator.service";
import {JwtSignable} from "../service/auth.service";
import {makeInstance} from "../utils/index";
import {isNumber, isString} from "util";
import isEmail from "validator/lib/isEmail";

export const usernameFormatIsValid = function(username: string | undefined): boolean {
  return !!username && RegExp(`^${usernamePattern}$`).test(username) && Buffer.byteLength(username) <= maxUsernameLength;
};

export const passwordFormatIsValid = function(password: string | undefined): boolean {
  return !!password && Buffer.byteLength(password) >= minPasswordLength;
};

export interface UserCreateInfo {
  username: string;
  password: string;
  email: string;
  role?: number;
}

const JWT_PAYLOAD_FIELD_MAPS = makeFieldMaps([
  $id, 'username', 'role'
]);

export class UserModel extends BaseModel implements JwtSignable {
  static readonly [$toJsonFields] = makeFieldMaps([
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

  static async create(body: UserCreateInfo): Promise<UserModel | undefined> {
    const user = UserModel.from({
      email: body.email,
      username: body.username,
      password: body.password,
      role: body.role || UserRanks[Roles.User]
    }) as UserModel;
    console.assert(passwordFormatIsValid(user.password));
    console.assert(usernameFormatIsValid(user.username));
    console.assert(!user.email || isEmail(user.email));
    await user.hashPassword();
    const [result] = await db.query(`INSERT INTO Users (username, email, role, salt, hash) VALUES(:username, :email, :role, :salt, :hash)`, user);
    user.id = (result as any).insertId;
    console.assert(isNumber(user.id));
    return user;
  }

  static async emailUsed(email: string): Promise<boolean> {
    console.assert(isEmail(email));
    const [rows] = await db.query(`SELECT id FROM Users WHERE email = :email LIMIT 1`, {email});
    return !!rows && !!(rows as any).length;
  }

  static async usernameUsed(username: string): Promise<boolean> {
    console.assert(usernameFormatIsValid(username));
    const [rows] = await db.query(`SELECT id FROM Users WHERE username = :username LIMIT 1`, {username});
    return !!rows && !!(rows as any).length;
  }

  static async findById(id: number | string): Promise<UserModel | undefined> {
    console.assert(isFinite(id as number));
    const [rows] = await db.query('SELECT * FROM Users WHERE id = :id', {id});
    if (rows && (rows as any).length) {
      return UserModel.from(rows[0]) as UserModel;
    }
  }

  static async authenticate(userName: string, password: string): Promise<UserModel | undefined> {
    if (!usernameFormatIsValid(userName) || !passwordFormatIsValid(password)) {
      return;
    }
    const [rows] = await db.query(`SELECT id, username, role, salt, hash FROM Users WHERE userName = :userName LIMIT 1`, {userName});
    if (rows && (rows as any).length) {
      const user = UserModel.from(rows[0]) as UserModel;
      if (await user!.verifyPassword(password)) {
        return user;
      }
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    const self = this;
    return passwordService.verifyPassword(self.salt!, self.hash!, password);
  }

  async hashPassword() {
    const self = this;
    console.assert(passwordFormatIsValid(self.password));
    self.salt = await passwordService.generateSalt();
    self.hash = await passwordService.passwordHash(self.salt, self.password!);
  }

  async changePassword(password: string) {
    this.password = password;
    await this.hashPassword();
    await db.execute(`UPDATE Users SET salt = :salt, hash = :hash WHERE id = :id`, this);
  }

  getJwtPayload(): Object {
    const self = this;
    self.obfuscate();
    return cloneByFieldMaps(self, JWT_PAYLOAD_FIELD_MAPS);
  }
}
