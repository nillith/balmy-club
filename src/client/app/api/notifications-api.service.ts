import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  unreadCount = 0;

  constructor(private http: HttpClient) {
  }

  async getNotifications() {
    return await this.http.get(API_URLS.NOTIFICATIONS).toPromise();
  }

  async getUnreadCount() {
    const self = this;
    const data = await self.http.get(`${API_URLS.NOTIFICATIONS}/unread-count`, {responseType: 'text'}).toPromise();
    return self.unreadCount = parseFloat(data);
  }
}
