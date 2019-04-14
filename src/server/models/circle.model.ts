import {DatabaseDriver, ModelBase} from "./model-base";
import {Connection, Pool} from "mysql2/promise";
import {devOnly, isNumericId} from "../utils/index";

const INSERT_SQL = `INSERT INTO Circles (name, ownerId) VALUES (:name, :ownerId)`;

const assertValidNewModel = devOnly(function(model: CircleModel) {
  console.assert(model.isNew(), `not a new model`);
  console.assert(model.name, `name required`);
  console.assert(isNumericId(model.ownerId), `invalid ownerId ${model.ownerId}`);
});

const assertValidUserAction = devOnly(function(model: CircleModel, userId: number) {
  console.assert(this.ownerId !== userId, `can't add owner to circle!`);
  console.assert(isNumericId(this.id), `invalid circle Id ${model.id}`);
});

export class CircleModel extends ModelBase {
  constructor(public name: string, public ownerId: number) {
    super();
  }

  async insertIntoDatabase(con: Connection | Pool): Promise<void> {
    const self = this;
    assertValidNewModel(self);
    await self.insertIntoDatabaseAndRetrieveId(con, INSERT_SQL, this);
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
