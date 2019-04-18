import { Injectable } from '@angular/core';
import {NotificationDialogComponent} from "./notification-dialog.component";
import {MatDialog} from "@angular/material";

@Injectable({
  providedIn: 'root'
})
export class NotificationDialogService {

  constructor(public dialog: MatDialog) {
  }

  popup(anchor: HTMLElement) {
    const self = this;
    setTimeout(() => {
      self.dialog.open(NotificationDialogComponent, {
        data: {
          anchor
        },
      });
    });
  }
}
