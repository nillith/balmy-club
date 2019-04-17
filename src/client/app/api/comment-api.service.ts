import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";

@Injectable({
  providedIn: 'root'
})
export class CommentApiService {
  constructor(private http: HttpClient) {
  }

  async plusOne(commentId: string) {
    const self = this;
    const data = await self.http.post(`${API_URLS.MY_COMMENTS}/${commentId}/plus`, undefined, {responseType: 'text'}).toPromise();
  }
}
