import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PostModel} from "../models/post.model";
import {UserModel} from "../models/user.model";

const API_URLS = {
  POST: 'api/posts',
  USER: 'api/users'
};

@Injectable({
  providedIn: 'root'
})
export class ModelFactoryService {

  constructor(private http: HttpClient) {
  }

  buildPost() {
    return new PostModel(this.http, API_URLS.POST);
  }

  buildUser() {
    return new UserModel(this.http, API_URLS.USER);
  }
}
