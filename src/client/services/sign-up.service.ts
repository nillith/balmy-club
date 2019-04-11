import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {setAccessToken} from "../utils/auth";

const Url = 'api/sign-up';

@Injectable({
  providedIn: 'root'
})

export class SignUpService {

  constructor(private http: HttpClient) {
  }

  private async postSignUp(data): Promise<string> {
    return this.http.post(Url, data, {responseType: 'text'}).toPromise();
  }

  async requestSignUp(email: string) {
    return this.postSignUp({email});
  }

  async signUp(token: string, username: string, password: string) {
    setAccessToken(await this.postSignUp({
      token, username, password
    }));
  }
}
