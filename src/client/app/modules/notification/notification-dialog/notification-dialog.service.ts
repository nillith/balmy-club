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
    const self = this;
    const count = await self.notificationsApi.getUnreadCount();
    if (count > 0) {
      setTimeout(() => {
        self.dialog.open(NotificationDialogComponent, {
          data: {
            anchor
          },
        });
      });
    }
  }
}
