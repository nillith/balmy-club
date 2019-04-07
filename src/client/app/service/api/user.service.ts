import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

class UserModel {
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  async create(username: string, password: string): Promise<UserModel> {
    const u = await this.http.post('api/users', {username, password}).toPromise();
    return u as UserModel;
  }

}
