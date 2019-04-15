import {DatabaseDriver, ModelBase} from "./model-base";
import {devOnly, disableStringify, isNumericId} from "../utils/index";
import _ from "lodash";
import {
  $userIds,
  CIRCLE_OBFUSCATE_MAPS,
  circleObfuscator,
  obfuscatorFuns,
  userObfuscator
} from "../service/obfuscator.service";
import db from "../persistence/index";
import {OtherUser} from "./user.model";

const INSERT_SQL = `INSERT INTO Circles (name, ownerId) VALUES (:name, :ownerId)`;

const assertValidNewModel = devOnly(function(model: CircleModel) {
  console.assert(model.isNew(), `not a new model`);
  console.assert(model.name, `name required`);
  console.assert(isNumericId(model.ownerId), `invalid ownerId ${model.ownerId}`);
});

const assertValidUserAction = devOnly(function(model: CircleModel, userId: number) {
  console.assert(model.ownerId !== userId, `can't add owner to circle!`);
  console.assert(isNumericId(model.id), `invalid circle Id ${model.id}`);
});

const assertValidUserIds = devOnly(function(model: CircleModel) {
  console.assert(isNumericId(model.id), `invalid ${model.id}`);
  console.assert(isNumericId(model.ownerId), `invalid ownerid ${model.ownerId}`);
  const {userIds} = model;
  console.assert(userIds && userIds.length, `no userIds`);
  _.each(userIds, (id) => {
    console.assert(isNumericId(id), `invalid user id ${id}`);
    console.assert(model.ownerId !== id, `can't add owner to circle!`);
  });
});

export interface CircleUsers {
  id: number | string;
  name?: string;
  userCount: number;
  users: OtherUser[];
}

export class CirclePacker {
  circles?: CircleUsers[];

  toJSON() {
    const {circles} = this;
    if (!circles) {
      return [];
    }

    return _.map(circles, (circle) => {
      return {
        id: circleObfuscator.obfuscate(circle.id as number),
        name: circle.name,
        userCount: circle.userCount,
        users: _.map(circle.users || [], (user) => {
          return {
            id: userObfuscator.obfuscate(user.id as number),
            nickname: user.nickname,
            avatarUrl: user.avatarUrl
          };
        })
      };
    });
  }
}

export class CircleModel extends ModelBase {
  userIds?: (number[]) | (string[]);
  [$userIds]?: string[];

  static unObfuscateFrom(obj: any): CircleModel | undefined {
    throw Error('Not implemented');
  }

  static async getAllCircleForUser(ownerId: number, driver: DatabaseDriver = db) {
    const [circleRows] = await driver.query(`SELECT id, name, userCount FROM Circles WHERE ownerId = :ownerId`, {ownerId});
    const data = await Promise.all(_.map((circleRows || []) as any[], async (circle) => {
      const [userRows] = await driver.query(`SELECT Users.id, Users.nickname, Users.avatarUrl FROM Users WHERE Users.id IN (SELECT userId FROM CircleUser WHERE circleId = :id)`, circle);
      circle.users = userRows;
      disableStringify(circle);
      disableStringify(circle.users);
      return circle as CircleUsers;
    }));
    disableStringify(data);
    const pack = new CirclePacker();
    pack.circles = data;
    return pack;
  }


  constructor(public name: string, public ownerId: number) {
    super();
  }


  async insertIntoDatabase(driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidNewModel(self);
    await self.insertIntoDatabaseAndRetrieveId(driver, INSERT_SQL, this);
    if (!_.isEmpty(self.userIds)) {
      await this.batchAddUser(driver);
    }
  }

  async batchAddUser(driver: DatabaseDriver = db) {
    const self = this;
    assertValidUserIds(this);
    if (!isNumericId(self.id)) {
      throw Error("Invalid circle id!");
    }
    await driver.query(`INSERT INTO CircleUser (circleId, userId) SELECT :circleId, Users.id FROM Users WHERE id IN (:userIds) AND id NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :ownerId)`, this);
  }

  async addUserId(userId: number, driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidUserAction(self, userId);
    await driver.query(`INSERT INTO CircleUser (circleId, userId) VALUES (:circleId, :userId)`, {
      circleId: self.id,
      userId
    });
  }

  async removeUserId(userId: number, driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidUserAction(self, userId);
    await driver.query(`DELETE FROM CircleUser WHERE circleId = :circleId AND userId = :userId`, {
      circleId: self.id,
      userId
    });
  }

  async removeSelf(ownerId: number, driver: DatabaseDriver = db) {
    await driver.query(`DELETE FROM Circles WHERE id = :id`, this);
  }
}


({
  unObfuscateFrom: CircleModel.unObfuscateFrom,
  obfuscate: CircleModel.prototype.obfuscate
} = obfuscatorFuns(CIRCLE_OBFUSCATE_MAPS, CircleModel));