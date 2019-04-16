import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IService} from "../../../services/i.service";
import {
  DirectSignUpRequest, EmailSignUpRequest, LoginRequest, SignUpRequest,
  SignUpWithTokenRequest
} from "../../../../../shared/request_interface";
import {API_URLS} from "../../../../constants";
import {SignUpTypes} from "../../../../../shared/constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private iService: IService) { }


  private async postSignUpPayload(payload: SignUpRequest): Promise<string> {
    return this.http.post(API_URLS.ACCOUNT, payload, {responseType: 'text'}).toPromise();
  }

  private async signUpWithPayload(payload: SignUpRequest) {
    const self = this;
    const authData = await self.postSignUpPayload(payload);
    self.iService.onLogin(JSON.parse(authData));
    location.reload();
  }

  async requestSignUp(payload: EmailSignUpRequest) {
    const {email} = payload;
    return this.postSignUpPayload({email, type: SignUpTypes.Email});
  }

  async signUpWithToken(payload: SignUpWithTokenRequest) {
    const self = this;
    const {token, username, password, nickname} = payload;
    await self.signUpWithPayload({
      token, username, password, nickname, type: SignUpTypes.WithToken
    });
  }

  async signUpWithUsername(payload: DirectSignUpRequest) {
    const self = this;
    const {email, username, password, nickname} = payload;
    await self.signUpWithPayload({
      email, username, password, nickname, type: SignUpTypes.Direct
    });
  }


  async login(payload: LoginRequest) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const loginResult = await self.http.post(API_URLS.LOGIN, {
      username,
      password,
      rememberMe
    }).toPromise() as any;
    self.iService.onLogin(loginResult);
  }
}
