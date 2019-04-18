import {Component, Input, OnInit} from '@angular/core';
import {NotificationData} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";
import {StringIds} from "../../i18n/translations/string-ids";

@Component({
  selector: 'app-post-action-view',
  templateUrl: './post-action-view.component.html',
  styleUrls: ['./post-action-view.component.scss']
})
export class PostActionViewComponent implements OnInit {
  Activity = Activity;
  StringIds = StringIds;
  @Input() notification: NotificationData;
  constructor() { }

  ngOnInit() {
  }

}
