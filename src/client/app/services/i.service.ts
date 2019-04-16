import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../../utils/auth";
import {AccessTokenData, UserData} from "../../../shared/interf";
import {API_URLS} from "../../constants";
import {UserModel} from "../models/user.model";
import {CircleModel} from "../models/circle.model";
import {DataStorage} from "../../utils/index";
import {ChangeSettingsRequest, LoginResponse} from "../../../shared/contracts";


const STORAGE_KEYS = {
  USER: 'user',
  CIRCLES: 'circles',
};

@Injectable({
  providedIn: 'root'
})
export class IService {
  private token: string;
  private tokenContent: AccessTokenData;
  public me;
  public circles: CircleModel[] = [];
  private storage?: DataStorage;
  public loading = false;


  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    const self = this;
    self.unpackToken(getAccessToken());
    if (self.isLoggedIn()) {
      self.loadUserFromStorage();
      self.loadCirclesFromStorage();
    }
    if (!self.me || self.me.isNew()) {
      self.logout();
    }
  }

  private unpackUserData(data: any) {
    if (!data) {
      return;
    }
    const self = this;
    self.me = new UserModel(self.http);
    self.me.assign(data);
    self.me.isMe = true;
  }

  private unpackCircleData(circleData: any) {
    if (!circleData) {
      return;
    }
    const self = this;
    self.circles = [];
    for (const c of circleData) {
      const circle = self.buildCircle();
      circle.assign(c);
      self.circles.push(circle);
    }

    for (const c of self.circles) {
      c.buildLookTable();
    }
  }

  private unpackToken(token: string) {
    const self = this;
    self.token = token;
    self.tokenContent = undefined;
    if (!token) {
      return;
    }
    const {jwtHelper} = self;
    if (jwtHelper.isTokenExpired(token)) {
      removeAccessToken();
    } else {
      self.tokenContent = jwtHelper.decodeToken(token);
      self.storage = new DataStorage(self.tokenContent.id);
      setAccessToken(token);
    }
  }

  private loadUserFromStorage() {
    const self = this;
    self.unpackUserData(self.storage.loadObject(STORAGE_KEYS.USER));
  }

  private loadCirclesFromStorage() {
    const self = this;
    self.unpackCircleData(self.storage.loadObject(STORAGE_KEYS.CIRCLES));
  }

  onLogin(data: LoginResponse) {
    const self = this;
    self.unpackToken(data.token);
    self.unpackUserData(data.user);
    self.unpackCircleData(data.circles);
    self.storage.saveObject(STORAGE_KEYS.USER, data.user);
    self.storage.saveObject(STORAGE_KEYS.CIRCLES, data.circles);
  }

  updateUserData(data: UserData) {
    const self = this;
    self.me.assign(data);
    self.storage.saveObject(self.tokenContent.id, data);
  }

  onCircleCreated(circle: CircleModel) {
    if (!circle || !circle.id) {
      return;
    }
    const self = this;
    self.circles.push(circle);
    const circlesData = self.storage.loadObject(STORAGE_KEYS.CIRCLES);
    const c = circle.assignOut();
    if (c.users) {
      c.users = c.users.map((u) => {
        return u.cloneModelFields([
          'id', 'nickname', 'avatarUrl'
        ]);
      });
    }
    circlesData.push(c);
    self.storage.saveObject(STORAGE_KEYS.CIRCLES, circlesData);
  }

  logout() {
    const self = this;
    self.token = self.tokenContent = undefined;
    removeAccessToken();
    localStorage.clear();
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return !!token && !jwtHelper.isTokenExpired(token);
  }

  getCirclesIdsContainsUser(userId: string) {
    const self = this;
    console.log(self);
    return self.circles.map((c) => {
      if (c.isInCircle(userId)) {
        return c.id;
      }
    }).filter(Boolean);
  }

  buildCircle() {
    const self = this;
    return new CircleModel(self.http, self.me.id, self);
  }

  async saveSettings(data: ChangeSettingsRequest) {
    const self = this;
    await self.http.patch(API_URLS.SETTINGS, data, {
      responseType: 'text'
    }).toPromise();
    self.updateUserData(data as UserData);
  }


  private createUser() {
    return new UserModel(this.http);
  }

  async viewUserById(id: string): Promise<UserModel> {
    const self = this;
    if (self.me.id === id) {
      return self.me;
    }
    const data = await self.http.get(`${API_URLS.USERS}/${id}`).toPromise();
    const user = self.createUser();
    user.assign(data);
    return user;
  }


  async changeUserCircles(user: UserModel, addCircleIds: string[], removeCircleIds: string[]) {
    if (!user || !user.id) {
      return;
    }
    if (addCircleIds && !addCircleIds.length) {
      addCircleIds = undefined;
    }

    if (removeCircleIds && !removeCircleIds.length) {
      removeCircleIds = undefined;
    }

    if (!addCircleIds && !removeCircleIds) {
      return;
    }
    const self = this;
    await self.http.patch(API_URLS.CIRCLES, {
      userId: user.id,
      addCircleIds,
      removeCircleIds
    }, {responseType: 'text'}).toPromise();

    if (addCircleIds) {
      for (const addId of addCircleIds) {
        const circle = _.find(self.circles, c => c.id === addId);
        circle.users.push(user.assignOut());
        circle.userIdMap[user.id] = user;
      }
    }

    if (removeCircleIds) {
      for (const removeId of removeCircleIds) {
        const circle = _.find(self.circles, c => c.id === removeId);
        _.remove(circle.users, (u) => {
          return u.id === user.id;
        });
        circle.userIdMap[user.id] = undefined;
      }
    }
    self.storage.saveObject(STORAGE_KEYS.CIRCLES, self.circles.map((c) => {
      return c.assignOut();
    }));
  }
}


