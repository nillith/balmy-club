import {Component, Input, OnInit} from '@angular/core';
import {NotificationData} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";
@Component({
  selector: 'app-notification-list-view',
  templateUrl: './notification-list-view.component.html',
  styleUrls: ['./notification-list-view.component.scss']
})
export class NotificationListViewComponent implements OnInit {
  @Input() notifications: NotificationData[];

  Activity = Activity;

  constructor() {
  }

  ngOnInit() {
  }
}
