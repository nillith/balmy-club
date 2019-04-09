import {HttpClient} from "@angular/common/http";
import {SignUpTypes} from "../../../shared/constants";
import {getAccessToken, removeAccessToken, setAssessToken} from "../../utils/auth";
import {AccessTokenContent, AuthPayload} from "../../../shared/interf";
import {Injectable} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";

const ACCOUNT_URL = 'api/account';
const LOGIN_URL = 'auth/local';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string;
  private tokenContent: AccessTokenContent;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.setToken(getAccessToken());
  }

  private setToken(token: string) {
    const self = this;
    self.token = token;
    self.tokenContent = undefined;
    if (!token) {
      return;
    }
    const {jwtHelper} = self;
    if (!jwtHelper.isTokenExpired(token)) {
      self.tokenContent = jwtHelper.decodeToken(token);
    }
  }

  async logout() {
    const self = this;
    self.token = self.tokenContent = undefined;
    removeAccessToken();
  }


  async login(payload: AuthPayload) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const user = await self.http.post(LOGIN_URL, {
      username,
      password,
      rememberMe
    }).toPromise();
    self.setToken((user as any).token);
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return token && !jwtHelper.isTokenExpired(token);
  }

  private async postSignUpPayload(payload: AuthPayload): Promise<string> {
    return this.http.post(ACCOUNT_URL, payload, {responseType: 'text'}).toPromise();
  }

  private async signUpWithPayload(payload: AuthPayload) {
    const self = this;
    const token = await self.postSignUpPayload(payload);
    setAssessToken(token);
    self.setToken(token);
  }

  async requestSignUp(payload: AuthPayload) {
    const {email} = payload;
    return this.postSignUpPayload({email});
  }

  async signUpWithToken(payload: AuthPayload) {
    const {token, username, password} = payload;
    return this.signUpWithPayload({
      token, username, password, type: SignUpTypes.WithToken
    });
  }

  async signUpWithEmail(payload: AuthPayload) {
    const {email, username, password} = payload;
    return this.signUpWithPayload({
      email, username, password, type: SignUpTypes.WithToken
    });
  }
}
