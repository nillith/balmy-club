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
    const _this = this;
    const data = await _this.http.post(`${API_URLS.COMMENTS}/${commentId}/plus`, undefined, {responseType: 'text'}).toPromise();
  }

  async unPlusOne(commentId: string) {
    const _this = this;
    const data = await _this.http.delete(`${API_URLS.COMMENTS}/${commentId}/plus`, {responseType: 'text'}).toPromise();
  }

  async deleteMyComment(commentId: string) {
    const _this = this;
    const data = await _this.http.delete(`${API_URLS.MY_COMMENTS}/${commentId}`, {responseType: 'text'}).toPromise();
  }

  async editMyComment(commentId: string, content: string) {
    const _this = this;
    const data = await _this.http.patch(`${API_URLS.MY_COMMENTS}/${commentId}`, {content}, {responseType: 'text'}).toPromise();
  }
}
