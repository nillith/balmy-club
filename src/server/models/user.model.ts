import db from '../persistence';
import passwordService from '../service/password.service';
import {
  assertValidId,
  assertValidObservation,
  DatabaseDriver,
  DatabaseRecordBase,
  fromDatabaseRow,
  insertReturnId,
  Observation,
} from "./model-base";
import {authService, JwtSignable} from "../service/auth.service";
import {devOnly, isNumericId} from "../utils/index";
import isEmail from "validator/lib/isEmail";
import {isValidEmailAddress, isValidNickname, isValidPassword, isValidUsername} from "../../shared/utils";
import {
  $id,
  $outboundCloneFields,
  obfuscatorFuns,
  USER_OBFUSCATE_MAPS,
  userObfuscator
} from "../service/obfuscator.service";
import _ from 'lodash';
import {CircleModel, CircleRecord} from "./circle.model";
import {ChangeSettingsRequest, MinimumUser} from "../../shared/contracts";
import {isNull, isUndefined} from "util";
import {NotificationModel} from "./notification.model";


const createSaveSettingsSql = (function() {
  const AllowedDbColumnMap = {
    username: 'username',
    nickname: 'nickname',
    avatarUrl: 'avatarUrl',
    bannerUrl: 'bannerUrl',
    email: 'email',
  };

  return function(data: ChangeSettingsRequest) {
    const updates = Object.keys(data).map((k) => {
      const col = AllowedDbColumnMap[k];
      if (col && data[k]) {
        return `\`${col}\` = :${k}`;
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


const assertCanVerifyPassword = devOnly(function(data: any) {
  console.assert(data[$salt] && data[$salt].length === 32, `invalid salt`);
  console.assert(data[$hash] && data[$hash].length === 64, `invalid hash`);
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
  avatarUrl?: string;
  bannerUrl?: string;
  role: number = 0;

  constructor(id: number, nickname: string) {
    super(id);
    this.nickname = nickname;
  }

  getJwtPayload(): any {
    const self = this;
    const result: any = {};
    result.id = userObfuscator.obfuscate(self[$id]);
    result.usename = self[$username];
    result.role = self.role;
    return result;
  }

  async verifyPassword(password: string): Promise<boolean> {
    const self = this;
    assertCanVerifyPassword(self);
    return passwordService.verifyPassword(password, self[$salt]!, self[$hash]!);
  }

  async hashPassword(password: string) {
    const self = this;
    [self[$salt], self[$hash]] = await generateSaltHashForPassword(password);
  }

  async changePassword(newPassword: string, driver: DatabaseDriver = db) {
    const self = this;
    await self.hashPassword(newPassword);
    await UserModel.changePassword({
      userId: self[$id],
      salt: self[$salt]!,
      hash: self[$hash]!
    }, driver);
  }

  async getLoginData(expire?: string | number, driver: DatabaseDriver = db) {
    const self = this;

    const tokenPromise = authService.sign(self, expire);
    const circlesPromise = CircleModel
      .getCirclesByOwnerId(self[$id], driver)
      .then((circles) => {
        return Promise.all(_.map(circles, async (circle) => {
          circle.users = await UserModel.findMinimumUsersInCircle(circle, driver);
          return circle;
        }));
      });

    const [rows] = await driver.query(`SELECT nickname, avatarUrl, bannerUrl, email FROM Users WHERE id = :id LIMIT 1`, {
      id: self[$id]
    });

    const user = self.toJSON();
    if (rows && rows[0]) {
      const row = rows[0];
      user.nickname = row.nickname;
      user.avatarUrl = row.avatarUrl;
      user.bannerUrl = row.bannerUrl;
      user.email = row.email;
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

  async saveSettings(data: ChangeSettingsRequest, driver: DatabaseDriver = db) {
    const self = this;
    const sql = createSaveSettingsSql(data);
    (data as any).id = self[$id];
    await driver.query(sql, data);
    if (data.password) {
      await self.changePassword(data.password, driver);
    }
  }

  async getSubscriberIds(driver: DatabaseDriver = db): Promise<number[]> {
    assertValidId(this[$id]);
    const [rows] = await driver.query(`SELECT subscriberId FROM Subscriptions WHERE subscribeeId = :id`, {
      id: this[$id]
    });
    return _.map(rows as any[], e => e.subscriberId);
  }
}

const {
  unObfuscateCloneFrom, obfuscateCloneTo, hideCloneFrom
} = obfuscatorFuns(USER_OBFUSCATE_MAPS);

UserRecord.prototype.obfuscateCloneTo = obfuscateCloneTo;
UserRecord.prototype.unObfuscateCloneFrom = unObfuscateCloneFrom;
UserRecord.prototype.hideCloneFrom = function(this: any, from: any) {
  const self = this;
  hideCloneFrom.call(this, from);
  self[$username] = from.username;
  self[$email] = from.email;
  self[$salt] = from.salt;
  self[$hash] = from.hash;
};

interface ChangePasswordParams {
  userId: number;
  salt: Buffer;
  hash: Buffer;
}

const assertValidSaltHash = devOnly(function(data: any) {
  console.assert(data.salt && data.salt.length === 32, `invalid salt`);
  console.assert(data.hash && data.hash.length === 64, `invalid hash`);
});

const assertValidChangePasswordParams = devOnly(function(data: any) {
  console.assert(isNumericId(data.userId), `invalid userId ${data.userId}`);
  assertValidSaltHash(data);
});

export interface RawUser {
  username: string;
  nickname: string;
  password: string;
  email?: string;
  role?: number;
  hash?: Buffer;
  salt?: Buffer;
}

const enum SQLs {
  INSERT = 'INSERT INTO Users (username, nickname, email, role, salt, hash) VALUES(:username, :nickname, :email, :role, :salt, :hash)',
  CHANGE_PASSWORD = 'UPDATE Users SET salt = :salt, hash = :hash WHERE id = :userId'
}


const assertValidRawUser = devOnly(function(data: any) {
  console.assert(isValidUsername(data.username), `invalid username ${data.username}`);
  console.assert(isValidNickname(data.nickname), `invalid nickname ${data.nickname}`);
  console.assert(isValidPassword(data.password), `invalid password ${data.password}`);
  console.assert(!data.email || (isValidEmailAddress(data.email) && isEmail(data.email)), `invalid email ${data.email}`);
  if (!data.email) {
    console.assert(isUndefined(data.email) || isNull(data.email), `empty string email`);
  }
  assertValidSaltHash(data);
});

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
  const salt = await passwordService.generateSalt();
  const hash = await passwordService.passwordHash(salt, password);
  return [salt, hash];
}


export class UserModel {
  static async insert(raw: RawUser, drive: DatabaseDriver = db): Promise<number> {
    [raw.salt, raw.hash] = await generateSaltHashForPassword(raw.password);
    assertValidRawUser(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }

  static async create(raw: RawUser, drive: DatabaseDriver = db): Promise<UserRecord> {
    const id = await this.insert(raw, drive);
    const row = Object.create(raw);
    row.id = id;
    return fromDatabaseRow(row, UserRecord);
  }

  static async changePassword(params: ChangePasswordParams, driver: DatabaseDriver = db) {
    assertValidChangePasswordParams(params);
    await driver.execute(SQLs.CHANGE_PASSWORD as string, params);
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
}


// static async getAllCircleForUser(ownerId: number, driver: DatabaseDriver = db) {
//   const [circleRows] = await driver.query('SELECT id, name, userCount FROM Circles WHERE ownerId = :ownerId', {ownerId});
//   const data = await Promise.all(_.map((circleRows || []) as any[], async (circle) => {
//     const [userRows] = await driver.query('SELECT Users.id, Users.nickname, Users.avatarUrl FROM Users WHERE Users.id IN (SELECT userId FROM CircleUser WHERE circleId = :id)', circle);
//     circle.users = userRows;
//     disableStringify(circle);
//     disableStringify(circle.users);
//     return circle as CircleUsers;
//   }));
//   disableStringify(data);
//   const pack = new CirclePacker();
//   pack.circles = data;
//   return pack;
// }
