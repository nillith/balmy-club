import {Component, Input, OnInit} from '@angular/core';
import {NotificationData, NotificationsApiService} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";
import {StringIds} from "../../i18n/translations/string-ids";

@Component({
  selector: 'app-notification-list-view',
  templateUrl: './notification-list-view.component.html',
  styleUrls: ['./notification-list-view.component.scss']
})
export class NotificationListViewComponent implements OnInit {
  @Input() notifications: NotificationData[];

  Activity = Activity;
  StringIds = StringIds;

  constructor(private notificationsApi: NotificationsApiService) {
  }

  ngOnInit() {
  }

  async onNotificationClick(n: NotificationData) {
    if (n.isRead) {
      return;
    }
    n.isRead = true;
    await this.notificationsApi.markNotificationAsReadById(n.id);
  }
}
