import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IService} from "../services/i.service";
import {API_URLS} from "../../constants";
import {ForgotPasswordRequest, ResetPasswordRequest} from "../../../shared/contracts";
import {isValidPassword} from "../../../shared/utils";

@Injectable({
  providedIn: 'root'
})
export class AccountApiService {

  constructor(private http: HttpClient, private iService: IService) {
  }

  async forgotPassword(payload: ForgotPasswordRequest) {
    return this.http.put(`${API_URLS.ACCOUNT}/password`, {email: payload.email}, {responseType: 'text'}).toPromise();
  }

  async resetPassword(payload: ResetPasswordRequest) {
    const {password, token} = payload;
    if (!isValidPassword(password) || !token) {
      return;
    }
    await this.http.post(`${API_URLS.ACCOUNT}/password`, {
      password, token
    }, {responseType: 'text'}).toPromise();
    return true;
  }
}
