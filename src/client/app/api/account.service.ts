import { Injectable } from '@angular/core';
import {AuthPayload, SignUpTypes} from "../../../shared/interf";
import {HttpClient} from "@angular/common/http";
import {IService} from "./i.service";

const ACCOUNT_URL = 'api/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient, private iService: IService) { }

  private async postSignUpPayload(payload: AuthPayload): Promise<string> {
    return this.http.post(ACCOUNT_URL, payload, {responseType: 'text'}).toPromise();
  }

  private async signUpWithPayload(payload: AuthPayload) {
    const self = this;
    const token = await self.postSignUpPayload(payload);
    self.iService.onNewToken(token);
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
