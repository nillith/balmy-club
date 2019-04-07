import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  async login(username: string, password: string): Promise<boolean> {
    const user = await this.http.post('auth/local', {
      username,
      password
    }).toPromise();
    return true;
  }
}
