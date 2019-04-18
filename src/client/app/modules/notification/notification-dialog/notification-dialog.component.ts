import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {NotificationsApiService} from "../../../api/notifications-api.service";
import {makeBackdropTransparent} from "../../../../utils/index";

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent implements OnInit {
  anchor: HTMLElement;
  constructor(public hostElement: ElementRef,
              public dialogRef: MatDialogRef<NotificationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { anchor: HTMLElement },
              public notificationsApi: NotificationsApiService) {
    this.anchor = data.anchor;
  }

  ngOnInit() {
    const self = this;
    setTimeout(function() {

      self.notificationsApi.fetchNotification();
      const {nativeElement} = self.hostElement;
      console.log(nativeElement);
      const {width, height} = nativeElement.getBoundingClientRect();
      console.log(`${width}:${height}`);
      const {anchor, dialogRef} = self;
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
