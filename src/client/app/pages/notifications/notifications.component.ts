import {Component, OnInit} from '@angular/core';
import {NotificationData, NotificationsApiService} from "../../api/notifications-api.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications: NotificationData[] = [];

  constructor(private notificationsApi: NotificationsApiService) {
  }

  async ngOnInit() {
    const self = this;
    await this.notificationsApi.getUnreadCount();
    self.notifications = await this.notificationsApi.getNotifications();
  }
}
