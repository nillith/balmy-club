import {DatabaseDriver, DatabaseRecordBase, fromDatabaseRow, insertReturnId} from "./model-base";
import {devOnly, isNumericId} from "../utils/index";
import _ from "lodash";
import {
  $outboundCloneFields, $ownerId, $userIds, CIRCLE_OBFUSCATE_MAPS,
  obfuscatorFuns
} from "../service/obfuscator.service";
import db from "../persistence/index";
import {isValidCircleName} from "../../shared/utils";
import {MinimumUser} from "../../shared/contracts";

export class CircleRecord extends DatabaseRecordBase {
  static readonly [$outboundCloneFields] = [
    'name',
    'userCount',
    'users',
  ];
  [$userIds]?: number[];
  [$ownerId]?: number;
  name: string;
  userCount: number;
  users?: MinimumUser[];

  constructor(id: number, name: string, userCount: number) {
    super(id);
    this.name = name;
    this.userCount = userCount;
  }
}

const {
  unObfuscateCloneFrom, obfuscateCloneTo, hideCloneFrom
} = obfuscatorFuns(CIRCLE_OBFUSCATE_MAPS);

CircleRecord.prototype.obfuscateCloneTo = obfuscateCloneTo;
CircleRecord.prototype.unObfuscateCloneFrom = unObfuscateCloneFrom;
CircleRecord.prototype.hideCloneFrom = hideCloneFrom;

export interface RawCircle {
  name: string;
  ownerId: number;
}

export interface UserCircleChanges {
  ownerId: number;
  userId: number;
  addCircleIds?: number[];
  removeCircleIds?: number[];
}

const assertValidRawCircle = devOnly(function(data: any) {
  console.assert(isValidCircleName(data.name), `invalid circle name ${data.name}`);
  console.assert(isNumericId(data.ownerId), `invalid ownerId ${data.ownerId}`);
});

const enum SQLs {
  INSERT = 'INSERT INTO Circles (name, ownerId) VALUES (:name, :ownerId)'
}

export class CircleModel {
  static async insert(raw: RawCircle, driver: DatabaseDriver = db): Promise<number> {
    assertValidRawCircle(raw);
    return insertReturnId(SQLs.INSERT as string, raw, driver);
  }

  static async syncUserCircleChanges(changes: UserCircleChanges, driver: DatabaseDriver = db) {
    const tasks: any[] = [];
    if (changes.removeCircleIds) {
      tasks.push(driver.query('DELETE FROM CircleUser WHERE CircleUser.userId = :userId AND CircleUser.circleId IN (SELECT id FROM Circles WHERE ownerId = :ownerId)', changes));
    }

    if (changes.addCircleIds) {
      tasks.push(driver.query('INSERT INTO CircleUser (userId, circleId) SELECT :userId, id FROM Circles WHERE id IN (:addCircleIds) AND ownerId = :ownerId', changes));
    }

    if (tasks.length) {
      await Promise.all(tasks);
    }
  }

  static async getCirclesByOwnerId(ownerId: number, driver: DatabaseDriver = db): Promise<CircleRecord[]> {
    const [circleRows] = await driver.query('SELECT id, name, userCount FROM Circles WHERE ownerId = :ownerId', {ownerId});
    return _.map(circleRows, (row) => {
      const circle = fromDatabaseRow(row, CircleRecord);
      circle[$ownerId] = ownerId;
      return circle;
    });
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
}


// const assertValidUserAction = devOnly(function(model: CircleModel, userId: number) {
//   console.assert(model.ownerId !== userId, `can't add owner to circle!`);
//   console.assert(isNumericId(model.id), `invalid circle Id ${model.id}`);
// });
//
// const assertValidUserIds = devOnly(function(model: CircleModel) {
//   console.assert(isNumericId(model.id), `invalid ${model.id}`);
//   console.assert(isNumericId(model.ownerId), `invalid ownerid ${model.ownerId}`);
//   const {userIds} = model;
//   console.assert(userIds && userIds.length, `no userIds`);
//   _.each(userIds, (id) => {
//     console.assert(isNumericId(id), `invalid user id ${id}`);
//     console.assert(model.ownerId !== id, `can't add owner to circle!`);
//   });
// });
//
//
// const assertValidUserCircleUpdateData = devOnly(function(data: UserCircleUpdateData) {
//   console.assert(isNumericId(data.ownerId), `invalid owner id ${data.ownerId}`);
//   console.assert(isNumericId(data.userId), `invalid user id ${data.userId}`);
//   if (data.addCircleIds) {
//     console.assert(data.addCircleIds.length > 0, `empty add circle`);
//     for (const c of data.addCircleIds) {
//       console.assert(isNumericId(c), `invalid circle id ${c}`);
//     }
//   }
//
//   if (data.removeCircleIds) {
//     console.assert(data.removeCircleIds.length > 0, `empty remove circle`);
//     for (const c of data.removeCircleIds) {
//       console.assert(isNumericId(c), `invalid circle id ${c}`);
//     }
//   }
// });
//
// export interface CircleUsers {
//   id: number | string;
//   name?: string;
//   userCount: number;
//   users: OtherUser[];
// }
//
// export class CirclePacker extends OutboundData {
//   circles?: CircleUsers[];
//
//   getOutboundData(): any {
//     const {circles} = this;
//     if (!circles) {
//       return [];
//     }
//
//     return _.map(circles, (circle) => {
//       return {
//         id: circleObfuscator.obfuscate(circle.id as number),
//         name: circle.name,
//         userCount: circle.userCount,
//         users: _.map(circle.users || [], (user) => {
//           return {
//             id: userObfuscator.obfuscate(user.id as number),
//             nickname: user.nickname,
//             avatarUrl: user.avatarUrl
//           };
//         })
//       };
//     });
//   }
// }
//
//
// export class CircleModel {
//
//
//   static async getAllCircleForUser(ownerId: number, driver: DatabaseDriver = db) {
//     const [circleRows] = await driver.query('SELECT id, name, userCount FROM Circles WHERE ownerId = :ownerId', {ownerId});
//     const data = await Promise.all(_.map((circleRows || []) as any[], async (circle) => {
//       const [userRows] = await driver.query('SELECT Users.id, Users.nickname, Users.avatarUrl FROM Users WHERE Users.id IN (SELECT userId FROM CircleUser WHERE circleId = :id)', circle);
//       circle.users = userRows;
//       disableStringify(circle);
//       disableStringify(circle.users);
//       return circle as CircleUsers;
//     }));
//     disableStringify(data);
//     const pack = new CirclePacker();
//     pack.circles = data;
//     return pack;
//   }
// }
//
