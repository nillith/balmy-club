import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../utils/auth";
import {AccessTokenContent, AuthPayload} from "../../shared/interf";


const LOGIN_URL = 'auth/local';

@Injectable({
  providedIn: 'root'
})
export class IService {
  private token: string;
  private tokenContent: AccessTokenContent;
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.onNewToken(getAccessToken());
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


  async login(payload: AuthPayload) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const user = await self.http.post(LOGIN_URL, {
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
