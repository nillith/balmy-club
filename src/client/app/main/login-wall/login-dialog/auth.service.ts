import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IService} from "../../../services/i.service";
import {
  DirectSignUpRequest,
  EmailSignUpRequest,
  LoginRequest,
  SignUpRequest,
  SignUpTypes,
  SignUpWithTokenRequest
} from "../../../../../shared/contracts";
import {API_URLS} from "../../../../constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private iService: IService) {
  }


  private async postSignUpPayload(payload: SignUpRequest): Promise<string> {
    return this.http.post(API_URLS.ACCOUNT, payload, {responseType: 'text'}).toPromise();
  }

  private async signUpWithPayload(payload: SignUpRequest) {
    const _this = this;
    const authData = await _this.postSignUpPayload(payload);
    _this.iService.onLogin(JSON.parse(authData));
    location.reload();
  }

  async requestSignUp(payload: EmailSignUpRequest) {
    const {email} = payload;
    return this.postSignUpPayload({email, type: SignUpTypes.Email});
  }

  async signUpWithToken(payload: SignUpWithTokenRequest) {
    const _this = this;
    const {token, username, password, nickname} = payload;
    await _this.signUpWithPayload({
      token, username, password, nickname, type: SignUpTypes.WithToken
    });
  }

  async signUpWithUsername(payload: DirectSignUpRequest) {
    const _this = this;
    const {email, username, password, nickname} = payload;
    await _this.signUpWithPayload({
      email, username, password, nickname, type: SignUpTypes.Direct
    });
  }

  async recoverPassword() {

  }


  async login(payload: LoginRequest) {
    const _this = this;
    const {username, password, rememberMe} = payload;
    const loginResult = await _this.http.post(API_URLS.LOGIN, {
      username,
      password,
      rememberMe
    }).toPromise() as any;
    _this.iService.onLogin(loginResult);
  }
}
