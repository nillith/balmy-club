import {ModelBase} from "./model-base";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {IService} from "../services/i.service";
import {MinimumUser} from "../../../shared/contracts";

const API_URL = API_URLS.CIRCLES;

export class CircleModelModifier {
  users?: MinimumUser[] = [];
  addUserList: MinimumUser[] = [];
  removeUserList: MinimumUser[] = [];
  name?: string;

  addToRemoveListByIndex(idx: number) {
    const _this = this;
    const user = _this.users && _this.users[idx];
    if (!user) {
      return;
    }

    _this.users.splice(idx, 1);
    if (user.id) {
      _this.removeUserList.push(user);
    }
  }

  addToAddUserList(usr: MinimumUser) {
    this.addUserList.push(usr);
  }

  constructor(public circle: CircleModel) {
    const _this = this;
    _this.name = circle.name;
    _this.users = [...circle.users];
  }

  commit() {
    const _this = this;
    const {circle} = _this;
    circle.name = _this.name;
    circle.addUserIds = _this.addUserList.map(u => u.id);
    circle.removeUserIds = _this.removeUserList.map(u => u.id);
    circle.buildLookTable();
  }
}

export class CircleModel extends ModelBase {
  static ASSIGN_FIELDS: string[] = [
    'id',
    'name',
    'users',
    'userCount',
  ];
  userIdMap: any = {};
  name?: string;
  users: MinimumUser[] = [];
  userIds?: string[];
  addUserIds?: string[];
  removeUserIds?: string[];
  userCount = 0;

  constructor(http: HttpClient, public ownerId: string, private iService: IService) {
    super(http);
  }

  public buildLookTable() {
    const _this = this;
    const map = _this.userIdMap = {};
    if (!_this.users) {
      return;
    }
    for (const u of _this.users) {
      map[u.id] = true;
    }
  }

  isInCircle(id: string) {
    return this.userIdMap[id];
  }


  protected async create(): Promise<void> {
    const _this = this;
    _this.id = await _this.http.post(API_URL, {
      name: _this.name,
      userIds: _this.users && _this.users.map(u => u.id)

    }, {responseType: 'text'}).toPromise();
    _this.iService.onCircleCreated(_this);
  }


  protected update(): Promise<void> {
    return undefined;
  }

  createModifier() {
    return new CircleModelModifier(this);
  }
}
