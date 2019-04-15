import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../../utils/auth";
import {AccessTokenData, AuthData, SettingsData, UserData} from "../../../shared/interf";
import {API_URLS} from "../../constants";
import {UserModel} from "../models/user.model";
import {CircleModel} from "../models/circle.model";

@Injectable({
  providedIn: 'root'
})
export class IService {
  private token: string;
  private tokenContent: AccessTokenData;
  private user: UserModel;
  private _circles: CircleModel[] = [];

  get me() {
    return this.user;
  }

  get circles() {
    return this._circles;
  }

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    const self = this;
    self.onNewToken(getAccessToken());
    self.user = new UserModel(http);
    if (self.isLoggedIn()) {
      const data = self.loadObject(self.tokenContent.id);
      if (data) {
        self.user.assign(data as UserData);
      }
    }
  }

  private loadObject(key?: string) {
    if (!key) {
      return;
    }
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  }

  private saveObject(key?: string, obj?: any) {
    if (!key || !obj) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(obj));
  }

  updateUserData(data: UserData) {
    const self = this;
    self.user.assign(data);
    self.saveObject(self.tokenContent.id, data);
  }

  onNewToken(token: string) {
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
      setAccessToken(token);
    }
  }

  onAuthSucceed(data: any) {
    console.log(data);
    const self = this;
    self.onNewToken(data.token);
    self.updateUserData(data.user);
  }

  async logout() {
    const self = this;
    self.token = self.tokenContent = undefined;
    removeAccessToken();
    localStorage.clear();
  }


  async login(payload: AuthData) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const loginResult = await self.http.post(API_URLS.LOGIN, {
      username,
      password,
      rememberMe
    }).toPromise() as any;
    self.onAuthSucceed(loginResult);
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return !!token && !jwtHelper.isTokenExpired(token);
  }

  buildCircle() {
    const self = this;
    return new CircleModel(self.http, self.me.id, self);
  }

  async saveSettings(data: SettingsData) {
    const self = this;
    await self.http.patch(API_URLS.SETTINGS, data, {
      responseType: 'text'
    });
    self.updateUserData(data as UserData);
  }
}
