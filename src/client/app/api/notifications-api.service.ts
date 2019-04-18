import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {MinimumUser, NotificationResponse} from "../../../shared/contracts";

export interface NotificationData extends NotificationResponse {
  subject: MinimumUser;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  unreadCount = 0;

  constructor(private http: HttpClient) {
  }

  async getNotifications(): Promise<NotificationData[]> {
    const notifications = await this.http.get(API_URLS.NOTIFICATIONS).toPromise() as NotificationData[];
    for (let n of notifications) {
      n.subject = {
        id: n.subjectId,
        nickname: n.subjectNickname,
        avatarUrl: n.subjectAvatarUrl
      };
    }
    return notifications;
  }

  async getUnreadCount() {
    const self = this;
    const data = await self.http.get(`${API_URLS.NOTIFICATIONS}/unread-count`, {responseType: 'text'}).toPromise();
    return self.unreadCount = parseFloat(data);
  }
}
