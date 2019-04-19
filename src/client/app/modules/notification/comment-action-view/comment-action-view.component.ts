import {Component, Input, OnInit} from '@angular/core';
import {NotificationData} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";
import {StringIds} from "../../i18n/translations/string-ids";

@Component({
  selector: 'app-comment-action-view',
  templateUrl: './comment-action-view.component.html',
  styleUrls: ['./comment-action-view.component.scss']
})
export class CommentActionViewComponent implements OnInit {
  @Input() notification: NotificationData;
  Activity = Activity;
  StringIds = StringIds;
  constructor() { }

  ngOnInit() {
  }

}
