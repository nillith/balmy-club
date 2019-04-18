import {Component, Input, OnInit} from '@angular/core';
import {NotificationData} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";

@Component({
  selector: 'app-user-action-view',
  templateUrl: './user-action-view.component.html',
  styleUrls: ['./user-action-view.component.scss']
})
export class UserActionViewComponent implements OnInit {
  Activity = Activity;
  @Input() notification: NotificationData;

  constructor() {
  }

  ngOnInit() {
  }

  contextUrl() {
    const {notification} = this;
    if (!notification) {
      return;
    }
    if (notification.contextType === Activity.ContextTypes.Post) {
      return `p/${notification.contextId}`;
    } else if (notification.contextType === Activity.ContextTypes.Comment) {
      return `p/${notification.contextExtraId}#${notification.contextId}`;
    }
    return '';
  }
}
