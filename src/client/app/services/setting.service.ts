import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {AvatarSettingDialogComponent} from "../shared/dialogs/avatar-setting-dialog/avatar-setting-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  avatarSettingDialog: MatDialogRef<AvatarSettingDialogComponent>;

  constructor(public dialog: MatDialog) {
  }

  showAvatarSettingDialog(anchor: HTMLElement) {
    const self = this;
    setTimeout(() => {
      self.avatarSettingDialog = self.dialog.open(AvatarSettingDialogComponent, {
        data: {
          anchor
        },
      });
    });
  }
}
