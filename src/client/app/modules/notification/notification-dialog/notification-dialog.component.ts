import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {NotificationsApiService} from "../../../api/notifications-api.service";
import {makeBackdropTransparent} from "../../../../utils/index";
import {StringIds} from "../../i18n/translations/string-ids";

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent implements OnInit {
  anchor: HTMLElement;
  StringIds = StringIds;

  constructor(public hostElement: ElementRef,
              public dialogRef: MatDialogRef<NotificationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { anchor: HTMLElement },
              public notificationsApi: NotificationsApiService) {
    this.anchor = data.anchor;
  }

  ngOnInit() {
    const _this = this;
    setTimeout(function() {

      // _this.notificationsApi.fetchNotification();
      const {nativeElement} = _this.hostElement;
      const {width, height} = nativeElement.getBoundingClientRect();
      const {anchor, dialogRef} = _this;
      const rect = anchor.getBoundingClientRect();
      const top = Math.floor(rect.bottom + 10);
      const right = Math.floor(rect.left - 133);
      dialogRef.updatePosition({
        right: `${right}px`,
        top: `${top}px`,
        left: `${right - width}px`,
        bottom: `${top + height}px`,
      });
      makeBackdropTransparent(nativeElement);
    });
  }

}
