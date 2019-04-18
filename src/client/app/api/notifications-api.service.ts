import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {MinimumUser, NotificationResponse} from "../../../shared/contracts";
import {NullaryAsyncAction} from "../../utils/switch-debouncer";
import _ from 'lodash';
import {ToastService} from "../services/toast.service";

export interface NotificationData extends NotificationResponse {
  subject: MinimumUser;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  unreadCount = 0;
  notifications: NotificationData[] = [];
  fetchTask: NullaryAsyncAction;
  loading = false;

  constructor(private http: HttpClient, private toast: ToastService) {
    const self = this;
    self.fetchTask = _.throttle(async () => {
      if (self.loading) {
        return;
      }
      try {
        self.loading = true;
        await self.getUnreadCount();
        if (self.unreadCount) {
          self.notifications = await self.getNotifications();
        }
      } catch (e) {
        self.toast.showToast(e.error || e.message);
      } finally {
        self.loading = false;
      }
    }, 1000);
  }

  private async getNotifications(): Promise<NotificationData[]> {
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


  fetchNotification() {
    this.fetchTask();
  }

  async getUnreadCount() {
    const self = this;
    const data = await self.http.get(`${API_URLS.NOTIFICATIONS}/unread-count`, {responseType: 'text'}).toPromise();
    return self.unreadCount = parseFloat(data);
  }

  async markNotificationAsReadById(notificationId: string) {
    const self = this;
    await self.http.post(`${API_URLS.NOTIFICATIONS}/${notificationId}/read`, {responseType: 'text'}).toPromise();
    --self.unreadCount;
  }
}
