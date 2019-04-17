import { Component, OnInit } from '@angular/core';
import {NotificationsApiService} from "../../api/notifications-api.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  constructor(private notificationsApi: NotificationsApiService) { }

  async ngOnInit() {
    const count = await this.notificationsApi.getUnreadCount();
    const notifications = await this.notificationsApi.getNotifications();
  }
}
