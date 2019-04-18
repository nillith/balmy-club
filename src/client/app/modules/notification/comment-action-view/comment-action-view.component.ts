import {Component, Input, OnInit} from '@angular/core';
import {NotificationData} from "../../../api/notifications-api.service";
import {Activity} from "../../../../../shared/interf";

@Component({
  selector: 'app-comment-action-view',
  templateUrl: './comment-action-view.component.html',
  styleUrls: ['./comment-action-view.component.scss']
})
export class CommentActionViewComponent implements OnInit {
  @Input() notification: NotificationData;
  Activity = Activity;
  constructor() { }

  ngOnInit() {
  }

}
