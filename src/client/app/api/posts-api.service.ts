import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {PostModel} from "../models/post.model";

@Injectable({
  providedIn: 'root'
})
export class PostsApiService {

  constructor(private http: HttpClient) {
  }

  async plusOne(postId: string) {
    const _this = this;
    const data = await _this.http.post(`${API_URLS.POSTS}/${postId}/plus`, undefined, {responseType: 'text'}).toPromise();
  }

  async unPlusOne(postId: string) {
    const _this = this;
    const data = await _this.http.delete(`${API_URLS.POSTS}/${postId}/plus`, {responseType: 'text'}).toPromise();
  }

  async getPostById(postId: string) {
    const _this = this;
    const data = await _this.http.get(`${API_URLS.POSTS}/${postId}`).toPromise() as any;
    data.author = {
      id: data.authorId,
      nickname: data.authorNickname,
      avatarUrl: data.authorAvatarUrl,
    };
    return data as any as PostModel;
  }

  async deleteMyPost(postId: string) {
    const _this = this;
    const data = await _this.http.delete(`${API_URLS.MY_POSTS}/${postId}`, {responseType: 'text'}).toPromise();
  }
}
