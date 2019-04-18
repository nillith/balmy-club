import {Component, OnInit} from '@angular/core';
import {NotificationData, NotificationsApiService} from "../../api/notifications-api.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {


  constructor(public notificationsApi: NotificationsApiService) {
  }

  async ngOnInit() {
    this.notificationsApi.fetchNotification();
  }
}
