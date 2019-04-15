import {ModelBase} from "./model-base";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {UserModel} from "./user.model";
import {IService} from "../services/i.service";

const API_URL = API_URLS.CIRCLES;

export class CircleModelModifier {
  users?: UserModel[] = [];
  addUserList: UserModel[] = [];
  removeUserList: UserModel[] = [];
  name?: string;

  addToRemoveListByIndex(idx: number) {
    const self = this;
    const user = self.users && self.users[idx];
    if (!user) {
      return;
    }

    self.users.splice(idx, 1);
    if (!user.isNew()) {
      self.removeUserList.push(user);
    }
  }

  addToAddUserList(usr: UserModel) {
    this.addUserList.push(usr);
  }

  constructor(public circle: CircleModel) {
    const self = this;
    self.name = circle.name;
    self.users = [...circle.users];
  }

  commit() {
    const self = this;
    const {circle} = self;
    circle.name = self.name;
    circle.addUserIds = self.addUserList.map(u => u.id);
    circle.removeUserIds = self.removeUserList.map(u => u.id);
    circle.buildLookTable();
  }
}

export class CircleModel extends ModelBase {
  static ASSIGN_FIELDS: string[] = [
    'id',
    'name',
    'users',
  ];
  userIdMap: any = {};
  name?: string;
  users: UserModel[] = [];
  userIds?: string[];
  addUserIds?: string[];
  removeUserIds?: string[];
  userCount = 0;

  constructor(http: HttpClient, public ownerId: string, private iService: IService) {
    super(http);
  }

  public buildLookTable() {
    const self = this;
    const map = self.userIdMap = {};
    if (!self.users) {
      return;
    }
    for (const u of self.users) {
      map[u.id] = true;
    }
  }

  isInCircle(id: string) {
    return this.userIdMap[id];
  }


  protected async create(): Promise<void> {
    const self = this;
    self.id = await self.http.post(API_URL, {
      name: self.name,
      userIds: self.users && self.users.map(u => u.id)

    }, {responseType: 'text'}).toPromise();
    self.iService.onCircleCreated(self);
  }


  protected update(): Promise<void> {
    return undefined;
  }

  createModifier() {
    return new CircleModelModifier(this);
  }
}
