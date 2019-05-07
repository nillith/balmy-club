import db from '../persistence';
import crypto from 'crypto';
import passwordService from '../service/password.service';
import {
  assertValidId,
  assertValidObservation,
  DatabaseDriver,
  DatabaseRecordBase,
  fromDatabaseRow,
  insertReturnId,
  Observation,
  updateOneSucceed,
} from "./model-base";
import {authService, JwtSignable} from "../service/auth.service";
import {devOnly, disableStringify, isNumericId, isValidURL, throwIfFalse} from "../utils/index";
import isEmail from "validator/lib/isEmail";
import {
  cloneFields,
  isValidEmailAddress,
  isValidNickname,
  isValidPassword,
  isValidStringId,
  isValidTicketFormat,
  isValidTimestamp,
  isValidUsername,
  utcTimestamp
} from "../../shared/utils";
import {
  $id,
  $outboundCloneFields,
  $userId,
  obfuscatorFuns,
  USER_OBFUSCATE_MAPS,
  userObfuscator
} from "../service/obfuscator.service";
import _ from 'lodash';
import {CircleModel, CircleRecord} from "./circle.model";
import {ChangeSettingsRequest, MinimumUser} from "../../shared/contracts";
import {isNull, isNumber, isUndefined} from "util";
import config from "../config";

export function generateTicket() {
  return crypto.randomBytes(config.ticketBytes);
}

function generateTextSecret(bytes) {
  return crypto.randomBytes(bytes)
    .toString('base64')
    .replace(/\//g, '')
    .replace(/\+/g, '')
    .replace(/=/g, '');
}

const createSaveSettingsSql = (function() {
  interface SettingColumnConfig {
    replacement?: string;
    allowNullInDb?: boolean;
  }

  const AllowedDbColumnMap: { [index: string]: SettingColumnConfig } = {
    username: {},
    nickname: {},
    avatarUrl: {
      allowNullInDb: true,
    },
    bannerUrl: {
      allowNullInDb: true,
    },
    email: {
      allowNullInDb: true,
    },
    password: {
      replacement: '`salt` = :salt, `hash` = :hash'
    }
  };

  return function(data: ChangeSettingsRequest) {
    const updates = Object.keys(data).map((k) => {
      const colConfig = AllowedDbColumnMap[k];
      if (!colConfig || (!colConfig.allowNullInDb && !data[k])) {
        return;
      } else if (colConfig.replacement) {
        return colConfig.replacement;
      } else {
        return `\`${k}\` = :${k}`;
      }
    })
      .filter(Boolean)
      .join(', ');
    return `UPDATE Users SET ${updates} WHERE id = :id`;
  };
})();

export const $username = Symbol();
export const $hash = Symbol();
export const $salt = Symbol();
export const $email = Symbol();
export const $ticket = Symbol();

const TICKET_ENCODING = 'hex';
const assertCanVerifyPassword = devOnly(function(data: any) {
  console.assert(data[$salt] && data[$salt].length === 32, `invalid salt`);
  console.assert(data[$hash] && data[$hash].length === 64, `invalid hash`);
});

export interface ActionTicketPayload {
  userId: string;
  ticket: string;
}

export function isValidActionTicketPayloadFormat(data: any) {
  return isValidStringId(data.userId) && isValidTicketFormat(data.ticket);
}

export const assertValidActionTicketPayloadFormat = devOnly(function(data: any) {
  console.assert(isValidStringId(data.userId), `invalid userId ${data.userId}`);
  console.assert(isValidTicketFormat(data.ticket), `invalid ticket ${data.ticket}`);
});

export class ActionTicket {
  [$userId]: number;
  [$ticket]: Buffer;

  constructor(userId: number, ticket: Buffer) {
    const _this = this;
    _this[$userId] = userId;
    _this[$ticket] = ticket;
  }

  toJSON(): ActionTicketPayload {
    const _this = this;
    return {
      userId: userObfuscator.obfuscate(_this[$userId]),
      ticket: _this[$ticket].toString(TICKET_ENCODING)
    };
  }

  static fromPayload(payload: ActionTicketPayload): ActionTicket | undefined {
    assertValidActionTicketPayloadFormat(payload);
    const userId = userObfuscator.unObfuscate(payload.userId);
    if (isNumericId(userId)) {
      const ticket = Buffer.from(payload.ticket, TICKET_ENCODING);
      return new ActionTicket(userId, ticket);
    }
  }
}

export const assertValidActionTicket = devOnly(function(data: any) {
  console.assert(!data.userId, `error userid`);
  console.assert(!data.ticket, `error userid`);
  assertValidActionTicketPayloadFormat(JSON.parse(JSON.stringify(data)));
});

export class UserRecord extends DatabaseRecordBase implements JwtSignable {
  static readonly [$outboundCloneFields] = [
    'nickname',
    'role',
    'avatarUrl',
    'bannerUrl'
  ];
  [$username]: string;
  nickname: string;
  [$email]: string;
  [$hash]?: Buffer;
  [$salt]?: Buffer;
  [$ticket]?: Buffer;
  avatarUrl?: string;
  bannerUrl?: string;
  createdAt?: number;
  role: number = 0;

  constructor(id: number, nickname: string) {
    super(id);
    this.nickname = nickname;
  }

  getJwtPayload(): any {
    const _this = this;
    const result: any = {};
    result.id = userObfuscator.obfuscate(_this[$id]);
    result.usename = _this[$username];
    result.role = _this.role;
    return result;
  }

  async verifyPassword(password: string): Promise<boolean> {
    const _this = this;
    assertCanVerifyPassword(_this);
    return passwordService.verifyPassword(password, _this[$salt]!, _this[$hash]!);
  }

  async hashPassword(password: string) {
    const _this = this;
    [_this[$salt], _this[$hash]] = await generateSaltHashForPassword(password);
  }

  async changePassword(newPassword: string, driver: DatabaseDriver = db) {
    const _this = this;
    await _this.hashPassword(newPassword);
    await UserModel.changePassword({
      userId: _this[$id],
      salt: _this[$salt]!,
      hash: _this[$hash]!
    }, driver);
  }

  async getToken(expire?: string | number) {
    const _this = this;
    return authService.sign(_this, expire);
  }

  async getLoginData(expire?: string | number, driver: DatabaseDriver = db) {
    const _this = this;

    const tokenPromise = _this.getToken(expire);
    const circlesPromise = CircleModel
      .getCirclesByOwnerId(_this[$id], driver)
      .then((circles) => {
        return Promise.all(_.map(circles, async (circle) => {
          circle.users = await UserModel.findMinimumUsersInCircle(circle, driver);
          return circle;
        }));
      });

    const [rows] = await driver.query(`SELECT username, nickname, avatarUrl, bannerUrl, email FROM Users WHERE id = :id LIMIT 1`, {
      id: _this[$id]
    });

    const user = _this.toJSON();
    if (rows && rows[0]) {
      cloneFields(rows[0], ['username', 'nickname', 'avatarUrl', 'bannerUrl', 'email'], user);
    }

    return {
      token: await tokenPromise,
      user,
      circles: await circlesPromise
    };
  }

  async isBlockByUser(userId: number, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidId(userId);
    const [rows] = await driver.query('SELECT id FROM UserBlockUser WHERE blockeeId = :myId AND blockerId = :userId LIMIT 1', {
      myId: this[$id],
      userId
    });
    return !_.isEmpty(rows);
  }

  async saveSettings(data: ChangeSettingsRequest, driver: DatabaseDriver = db): Promise<boolean> {
    const _this = this;
    const sql = createSaveSettingsSql(data);
    const replacements: any = Object.create(data);
    replacements.id = _this[$id];
    if (data.password) {
      replacements.password = undefined;
      await _this.hashPassword(data.password);
      replacements.salt = _this[$salt];
      replacements.hash = _this[$hash];
    }
    const [result] = await driver.query(sql, replacements);
    return 1 === (result as any).changedRows;
  }

  async getSubscriberIds(driver: DatabaseDriver = db): Promise<number[]> {
    assertValidId(this[$id]);
    const [rows] = await driver.query(`SELECT subscriberId FROM Subscriptions WHERE subscribeeId = :id`, {
      id: this[$id]
    });
    return _.map(rows as any[], e => e.subscriberId);
  }

  async newActionTicket(driver: DatabaseDriver = db): Promise<ActionTicket> {
    const _this = this;
    _this[$ticket] = generateTicket();
    await driver.query(`UPDATE Users SET ticket = :ticket WHERE id = :id`, {
      id: _this[$id],
      ticket: _this[$ticket]
    });

    return new ActionTicket(_this[$id], _this[$ticket]!);
  }
}

const {
  unObfuscateCloneFrom, obfuscateCloneTo, hideCloneFrom
} = obfuscatorFuns(USER_OBFUSCATE_MAPS);

UserRecord.prototype.obfuscateCloneTo = obfuscateCloneTo;
UserRecord.prototype.unObfuscateCloneFrom = unObfuscateCloneFrom;
UserRecord.prototype.hideCloneFrom = function(this: any, from: any) {
  const _this = this;
  hideCloneFrom.call(this, from);
  _this[$username] = from.username;
  _this[$email] = from.email;
  _this[$salt] = from.salt;
  _this[$hash] = from.hash;
};

interface ChangePasswordParams {
  userId: number;
  salt: Buffer;
  hash: Buffer;
}


function throwIfInvalidSaltHash(data: any) {
  throwIfFalse(data.salt && data.salt.length === 32, `invalid salt`);
  throwIfFalse(data.hash && data.hash.length === 64, `invalid hash`);
}

const assertValidSaltHash = devOnly(throwIfInvalidSaltHash);

const assertValidChangePasswordParams = devOnly(function(data: any) {
  console.assert(isNumericId(data.userId), `invalid userId ${data.userId}`);
  assertValidSaltHash(data);
});

export interface RawUser {
  username?: string;
  nickname: string;
  password: string;
  twitterId?: number;
  createdAt: number;
  email?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  role?: number;
  hash?: Buffer;
  salt?: Buffer;
}

const enum SQLs {
  INSERT = 'INSERT INTO Users (username, nickname, email, role, createdAt, salt, hash, twitterId, avatarUrl, bannerUrl) VALUES(:username, :nickname, :email, :role, :createdAt, :salt, :hash, :twitterId, :avatarUrl, :bannerUrl)',
  CHANGE_PASSWORD = 'UPDATE Users SET salt = :salt, hash = :hash WHERE id = :userId'
}

const throwIfInvalidRawUser = function(data: any) {
  throwIfFalse(isValidUsername(data.username), `invalid username ${data.username}`);
  throwIfFalse(data.username || data.twitterId, `must have either username or twitterId`);
  if (data.twitterId) {
    throwIfFalse(isNumber(data.twitterId), `invalid twitterId ${data.twitterId}`);
  }
  throwIfFalse(isValidNickname(data.nickname), `invalid nickname ${data.nickname}`);
  throwIfFalse(isValidPassword(data.password), `invalid password ${data.password}`);
  throwIfFalse(isValidTimestamp(data.createdAt), `invalid createdAt ${data.createdAt}`);
  throwIfFalse(!data.email || (isValidEmailAddress(data.email) && isEmail(data.email)), `invalid email ${data.email}`);
  if (!data.email) {
    throwIfFalse(isUndefined(data.email) || isNull(data.email), `empty string email`);
  }
  if (!data.avatarUrl) {
    throwIfFalse(isValidURL(data.avatarUrl), `invalid avatarUrl ${data.avatarUrl}`);
  }
  if (!data.bannerUrl) {
    throwIfFalse(isValidURL(data.bannerUrl), `invalid avatarUrl ${data.bannerUrl}`);
  }
};

const assertValidRawUserWithSaltHash = devOnly(function(data: any) {
  throwIfInvalidRawUser(data);
  throwIfInvalidSaltHash(data);
});


function twitterProfileToRawUser(profile: any): RawUser {
  const result = {} as RawUser;
  if (profile.photos && profile.photos[0]) {
    result.avatarUrl = profile.photos[0].value;
  }
  const json = profile._json;
  result.bannerUrl = json.profile_banner_url;
  result.username = generateTextSecret(20).substr(0, 24);
  result.password = generateTextSecret(96);
  result.twitterId = json.id;
  result.createdAt = utcTimestamp();
  result.nickname = json.name;
  throwIfInvalidRawUser(result);
  return result;
}

const assertValidPassword = devOnly(function(password: any) {
  console.assert(isValidPassword(password), `invalid password ${password}`);
});

const assertValidUsername = devOnly(function(username: any) {
  console.assert(isValidUsername(username), `invalid username ${username}`);
});

const assertValidEmail = devOnly(function(email: any) {
  console.assert(isEmail(email), `invalid email ${email}`);
});

async function generateSaltHashForPassword(password: string): Promise<[Buffer, Buffer]> {
  assertValidPassword(password);
  const salt = passwordService.generateSalt();
  const hash = await passwordService.passwordHash(salt, password);
  return [salt, hash];
}

export interface UserIdNickname {
  id: number;
  nickname: string;
}

export interface NicknameAvatar extends UserIdNickname {
  avatarUrl?: string;
}


export class UserModel {
  static async insert(raw: RawUser, driver: DatabaseDriver = db): Promise<number> {
    [raw.salt, raw.hash] = await generateSaltHashForPassword(raw.password);
    assertValidRawUserWithSaltHash(raw);
    return insertReturnId(SQLs.INSERT as string, raw, driver);
  }

  static async create(raw: RawUser, driver: DatabaseDriver = db): Promise<UserRecord> {
    const id = await this.insert(raw, driver);
    const row = Object.create(raw);
    row.id = id;
    return fromDatabaseRow(row, UserRecord);
  }

  static async signUpWithTwitter(profile: any, driver: DatabaseDriver = db): Promise<UserRecord> {
    return UserModel.create(twitterProfileToRawUser(profile), driver);
  }

  static async changePassword(params: ChangePasswordParams, driver: DatabaseDriver = db) {
    assertValidChangePasswordParams(params);
    await driver.execute(SQLs.CHANGE_PASSWORD as string, params);
  }

  static async resetPassword(password: string, ticket: ActionTicket, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidPassword(password);
    assertValidActionTicket(ticket);
    const [salt, hash] = await generateSaltHashForPassword(password);
    const [queryResult] = await driver.query(`UPDATE Users SET salt = :salt, hash = :hash, ticket = null WHERE id = :id AND ticket = :ticket LIMIT 1`, {
      salt, hash,
      id: ticket[$userId],
      ticket: ticket[$ticket]
    });
    return updateOneSucceed(queryResult);
  }

  static async emailExistsInDatabase(email: string, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidEmail(email);
    const [rows] = await driver.query('SELECT id FROM Users WHERE email = :email LIMIT 1', {email});
    return !!rows && !!(rows as any).length;
  }

  static async usernameExistsInDatabase(username: string, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidUsername(username);
    const [rows] = await driver.query('SELECT id FROM Users WHERE username = :username LIMIT 1', {username});
    return !!rows && !!(rows as any).length;
  }

  static async findUserByUsername(username: string, driver: DatabaseDriver = db): Promise<UserRecord | undefined> {
    assertValidUsername(username);
    const [rows] = await driver.query(`SELECT id, username, role, salt, hash FROM Users WHERE userName = :username LIMIT 1`, {username});
    if (!_.isEmpty(rows)) {
      return fromDatabaseRow(rows[0], UserRecord);
    }
  }

  static async findUserByTwitterId(twitterId: number, driver: DatabaseDriver = db): Promise<UserRecord | undefined> {
    const [rows] = await driver.query(`SELECT id, username, role, salt, hash FROM Users WHERE twitterId = :twitterId LIMIT 1`, {twitterId});
    if (!_.isEmpty(rows)) {
      return fromDatabaseRow(rows[0], UserRecord);
    }
  }

  static async findUserByEmail(email: string, driver: DatabaseDriver = db): Promise<UserRecord | undefined> {
    assertValidEmail(email);
    const [rows] = await driver.query(`SELECT id, username, role, salt, hash FROM Users WHERE email = :email LIMIT 1`, {email});
    if (!_.isEmpty(rows)) {
      return fromDatabaseRow(rows[0], UserRecord);
    }
  }

  static async authenticate(username: string, password: string): Promise<UserRecord | undefined> {
    if (!isValidUsername(username) || !isValidPassword(password)) {
      return;
    }
    const user = await this.findUserByUsername(username);
    if (user && await user.verifyPassword(password)) {
      return user;
    }
  }

  static async findUserByObservation(observation: Observation, driver: DatabaseDriver = db): Promise<UserRecord | undefined> {
    assertValidObservation(observation);
    const [rows] = await driver.query('SELECT nickname, avatarUrl, bannerUrl, circlerCount, UserBlockUser.id IS NOT NULL AS blockedByMe FROM Users LEFT JOIN (SELECT id, blockeeId FROM UserBlockUser WHERE blockeeId = :userId AND blockerId = :observerId ) UserBlockUser ON (Users.id = UserBlockUser.blockeeId) WHERE Users.id = :targetId LIMIT 1', observation);
    if (!_.isEmpty(rows)) {
      return fromDatabaseRow(rows[0], UserRecord);
    }
  }

  static async findMinimumUsersInCircle(circle: CircleRecord, driver: DatabaseDriver = db): Promise<MinimumUser[]> {
    const [userRows] = await driver.query('SELECT Users.id, Users.nickname, Users.avatarUrl FROM Users WHERE Users.id IN (SELECT userId FROM CircleUser WHERE circleId = :circleId)', {
      circleId: circle[$id]
    });
    return _.map(userRows, ({id, nickname, avatarUrl}) => {
      return {
        id: userObfuscator.obfuscate(id),
        nickname, avatarUrl
      };
    });
  }

  static async findNicknameAvatarById(userId: number, driver: DatabaseDriver = db): Promise<NicknameAvatar | undefined> {
    const [rows] = await driver.query(`SELECT id, nickname, avatarUrl FROM Users WHERE id =:userId`, {
      userId
    });
    if (rows && rows[0]) {
      disableStringify(rows[0]);
      return rows[0];
    }
  }

  static async findNicknameAvatarsByIds(userIds: number[], driver: DatabaseDriver = db): Promise<NicknameAvatar[]> {
    const [rows] = await driver.query(`SELECT id, nickname, avatarUrl FROM Users WHERE id = (:userIds)`, {
      userIds
    });

    return _.map(rows, (row) => {
      disableStringify(row);
      return row;
    });
  }

  static async findMentionableUsers(userIds: number[], mentionerId: number): Promise<UserIdNickname[]> {
    const [rows] = await db.query('SELECT Users.id, Users.nickname FROM Users WHERE Users.id IN (:userIds) AND Users.id NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :mentionerId)', {
      userIds,
      mentionerId
    });
    return rows as UserIdNickname[];
  }
}
