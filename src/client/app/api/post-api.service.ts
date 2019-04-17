import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";

@Injectable({
  providedIn: 'root'
})
export class PostApiService {

  constructor(private http: HttpClient) {
  }

  async plusOne(postId: string) {
    const self = this;
    const data = await self.http.post(`${API_URLS.POSTS}/${postId}/plus`, undefined, {responseType: 'text'}).toPromise();
  }

  async unPlusOne(postId: string) {
    const self = this;
    const data = await self.http.delete(`${API_URLS.POSTS}/${postId}/plus`,  {responseType: 'text'}).toPromise();
  }
}
