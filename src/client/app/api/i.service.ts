import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../../utils/auth";
import {AccessTokenData, AuthData, UserData} from "../../../shared/interf";
import {API_URLS} from "../../constants";
import {UserModel} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class IService {
  private token: string;
  private tokenContent: AccessTokenData;
  private user: UserModel;

  get me() {
    return this.user;
  }

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    const self = this;
    self.onNewToken(getAccessToken());
    self.user = new UserModel(http);
    if (self.isLoggedIn()) {
      const data = localStorage.getItem(self.tokenContent.id);
      self.user.assign(JSON.parse(data) as UserData);
    }
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

  async logout() {
    const self = this;
    self.token = self.tokenContent = undefined;
    removeAccessToken();
    localStorage.clear();
  }


  async login(payload: AuthData) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const user = await self.http.post(API_URLS.LOGIN, {
      username,
      password,
      rememberMe
    }).toPromise();
    self.onNewToken((user as any).token);
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return !!token && !jwtHelper.isTokenExpired(token);
  }
}
