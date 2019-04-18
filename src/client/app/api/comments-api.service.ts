import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";

@Injectable({
  providedIn: 'root'
})
export class CommentsApiService {
  constructor(private http: HttpClient) {
  }

  async plusOne(commentId: string) {
    const self = this;
    const data = await self.http.post(`${API_URLS.COMMENTS}/${commentId}/plus`, undefined, {responseType: 'text'}).toPromise();
  }

  async unPlusOne(commentId: string) {
    const self = this;
    const data = await self.http.delete(`${API_URLS.COMMENTS}/${commentId}/plus`, {responseType: 'text'}).toPromise();
  }

  async deleteCommentById(commentId: string) {
    const self = this;
    const data = await self.http.delete(`${API_URLS.MY_COMMENTS}/${commentId}`, {responseType: 'text'}).toPromise();
  }
}
