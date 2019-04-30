import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../../utils/auth";
import {AccessTokenData, UserData} from "../../../shared/interf";
import {API_URLS} from "../../constants";
import {CircleModel} from "../models/circle.model";
import {DataStorage} from "../../utils/index";
import {ChangeSettingsRequest, LoginResponse, MinimumUser, UserResponse} from "../../../shared/contracts";
import _ from 'lodash';
import {CommentModel} from "../models/comment.model";
import {NotificationsApiService} from "../api/notifications-api.service";
import {UserInfoService} from "../modules/user-info/user-info.service";

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
  public allUsers: MinimumUser[] = [];


  constructor(private http: HttpClient,
              private jwtHelper: JwtHelperService,
              private notificationsApi: NotificationsApiService,
              private userInfoService: UserInfoService) {
    const _this = this;
    _this.unpackToken(getAccessToken());
    if (_this.isLoggedIn()) {
      _this.loadUserFromStorage();
      _this.loadCirclesFromStorage();
      _this.notificationsApi.onLogin();
    }
    if (!_this.me || !_this.me.id) {
      _this.logout();
    }
  }

  private unpackUserData(data: any) {
    if (!data) {
      return;
    }
    const _this = this;
    _this.me = data;
    _this.me.isMe = true;
  }

  private unpackCircleData(circleData: any) {
    if (!circleData) {
      return;
    }
    const _this = this;
    _this.circles = [];
    for (const c of circleData) {
      const circle = _this.buildCircle();
      circle.assign(c);
      _this.circles.push(circle);
    }

    for (const c of _this.circles) {
      c.buildLookTable();
    }

    const users: any = {};
    for (const c of _this.circles) {
      if (c.users) {
        for (const u of c.users) {
          users[u.id] = u;
        }
      }
    }
    _this.allUsers = Object.values(users) as MinimumUser[];
  }

  private unpackToken(token: string) {
    const _this = this;
    _this.token = token;
    _this.tokenContent = undefined;
    if (!token) {
      return;
    }
    const {jwtHelper} = _this;
    if (jwtHelper.isTokenExpired(token)) {
      removeAccessToken();
    } else {
      _this.tokenContent = jwtHelper.decodeToken(token);
      _this.storage = new DataStorage(_this.tokenContent.id);
      setAccessToken(token);
    }
  }

  private loadUserFromStorage() {
    const _this = this;
    _this.unpackUserData(_this.storage.loadObject(STORAGE_KEYS.USER));
  }

  private loadCirclesFromStorage() {
    const _this = this;
    _this.unpackCircleData(_this.storage.loadObject(STORAGE_KEYS.CIRCLES));
  }

  onLogin(data: LoginResponse) {
    const _this = this;
    _this.unpackToken(data.token);
    _this.unpackUserData(data.user);
    _this.unpackCircleData(data.circles);
    _this.storage.saveObject(STORAGE_KEYS.USER, data.user);
    _this.storage.saveObject(STORAGE_KEYS.CIRCLES, data.circles);
    _this.notificationsApi.onLogin();
  }

  updateUserData(data: UserData) {
    const _this = this;
    _this.me = data;
    _this.storage.saveObject(_this.tokenContent.id, data);
  }

  onCircleCreated(circle: CircleModel) {
    if (!circle || !circle.id) {
      return;
    }
    const _this = this;
    _this.circles.push(circle);
    const circlesData = _this.storage.loadObject(STORAGE_KEYS.CIRCLES);
    const c = circle.assignOut();
    // if (c.users) {
    //   c.users = c.users.map((u) => {
    //     return u.cloneModelFields([
    //       'id', 'nickname', 'avatarUrl'
    //     ]);
    //   });
    // }
    circlesData.push(c);
    _this.storage.saveObject(STORAGE_KEYS.CIRCLES, circlesData);
  }

  logout() {
    const _this = this;
    _this.token = _this.tokenContent = undefined;
    removeAccessToken();
    localStorage.clear();
    _this.notificationsApi.onLogout();
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return !!token && !jwtHelper.isTokenExpired(token);
  }

  getCirclesIdsContainsUser(userId: string) {
    const _this = this;
    return _this.circles.map((c) => {
      if (c.isInCircle(userId)) {
        return c.id;
      }
    }).filter(Boolean);
  }

  buildCircle() {
    const _this = this;
    return new CircleModel(_this.http, _this.me.id, _this);
  }

  isMyId(id: string): boolean {
    return id === this.me.id;
  }

  async saveSettings(data: ChangeSettingsRequest) {
    const _this = this;
    await _this.http.patch(API_URLS.SETTINGS, data, {
      responseType: 'text'
    }).toPromise();
    _this.updateUserData(data as UserData);
  }


  async viewUserById(id: string): Promise<UserResponse> {
    const _this = this;
    if (_this.me.id === id) {
      return _this.me;
    }
    const data = await _this.http.get(`${API_URLS.USERS}/${id}`).toPromise();
    return data as UserResponse;
  }


  async changeUserCircles(user: MinimumUser, addCircleIds: string[], removeCircleIds: string[]) {
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
    const _this = this;
    await _this.http.patch(`${API_URLS.CIRCLES}/user`, {
      userId: user.id,
      addCircleIds,
      removeCircleIds
    }, {responseType: 'text'}).toPromise();

    if (addCircleIds) {
      for (const addId of addCircleIds) {
        const circle = _.find(_this.circles, c => c.id === addId);
        circle.users.push(user);
        circle.userIdMap[user.id] = user;
      }
    }

    if (removeCircleIds) {
      for (const removeId of removeCircleIds) {
        const circle = _.find(_this.circles, c => c.id === removeId);
        _.remove(circle.users, (u) => {
          return u.id === user.id;
        });
        circle.userIdMap[user.id] = undefined;
      }
    }
    _this.storage.saveObject(STORAGE_KEYS.CIRCLES, _this.circles.map((c) => {
      return c.assignOut();
    }));
  }

  createComment(postId: string): CommentModel {
    return new CommentModel(this.http, postId);
  }
}


