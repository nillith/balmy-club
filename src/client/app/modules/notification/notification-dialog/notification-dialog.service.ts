import {Injectable} from '@angular/core';
import {NotificationDialogComponent} from "./notification-dialog.component";
import {MatDialog} from "@angular/material";
import {NotificationsApiService} from "../../../api/notifications-api.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationDialogService {

  constructor(public dialog: MatDialog, private notificationsApi: NotificationsApiService) {
  }

  async popup(anchor: HTMLElement) {
    const _this = this;
    const count = _this.notificationsApi.unreadCount
    if (count > 0) {
      setTimeout(() => {
        _this.dialog.open(NotificationDialogComponent, {
          data: {
            anchor
          },
        });
      });
    }
  }
}
