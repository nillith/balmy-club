import {DatabaseDriver, ModelBase} from "./model-base";
import {devOnly, isNumericId} from "../utils/index";
import _ from "lodash";
import {$userIds} from "../service/obfuscator.service";

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
  });
});


export class CircleModel extends ModelBase {
  userIds?: (number[]) | (string[]);
  [$userIds]?: string[];

  static unObfuscateFrom(obj: any): CircleModel | undefined {
    throw Error('Not implemented');
  }

  constructor(public name: string, public ownerId: number) {
    super();
  }


  async insertIntoDatabase(driver: DatabaseDriver): Promise<void> {
    const self = this;
    assertValidNewModel(self);
    await self.insertIntoDatabaseAndRetrieveId(driver, INSERT_SQL, this);
    if (!_.isEmpty(self.userIds)) {
      await this.batchAddUser(driver);
    }
  }

  async batchAddUser(driver: DatabaseDriver) {
    const self = this;
    assertValidUserIds(this);
    if (!isNumericId(self.id)) {
      throw Error("Invalid circle id!");
    }
    await driver.query(`INSERT INTO CircleUser (circleId, userId) SELECT :circleId, Users.id FROM Users WHERE id IN (:userIds) AND id NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :ownerId)`, this);
  }

  async addUserId(driver: DatabaseDriver, userId: number): Promise<void> {
    const self = this;
    assertValidUserAction(self, userId);
    await driver.query(`INSERT INTO CircleUser (circleId, userId) VALUES (:circleId, :userId)`, {
      circleId: self.id,
      userId
    });
  }

  async removeUserId(driver: DatabaseDriver, userId: number): Promise<void> {
    const self = this;
    assertValidUserAction(self, userId);
    await driver.query(`DELETE FROM CircleUser WHERE circleId = :circleId AND userId = :userId`, {
      circleId: self.id,
      userId
    });
  }

  async removeSelf(driver: DatabaseDriver) {
    await driver.query(`DELETE FROM Circles WHERE id = :id`, this);
  }
}


({
  unObfuscateFrom: CircleModel.unObfuscateFrom,
  obfuscate: CircleModel.prototype.obfuscate
} = obfuscatorFuns(USER_OBFUSCATE_MAPS, CircleModel));
