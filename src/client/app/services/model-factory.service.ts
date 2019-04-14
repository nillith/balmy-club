import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PostModel} from "../models/post.model";
import {UserModel} from "../models/user.model";


@Injectable({
  providedIn: 'root'
})
export class ModelFactoryService {

  constructor(private http: HttpClient) {
  }

  buildPost() {
    return new PostModel(this.http);
  }

  buildUser() {
    return new UserModel(this.http);
  }
}
