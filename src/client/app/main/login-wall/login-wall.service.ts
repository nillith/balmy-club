import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {IService} from "../../services/i.service";

@Injectable({
  providedIn: 'root'
})
export class LoginWallService {

  loginDialog: MatDialogRef<LoginDialogComponent>;
  private guarding = false;

  constructor(public dialog: MatDialog, private iService: IService) {
  }

  isLoggedIn() {
    const self = this;
    if (self.guarding) {
      return false;
    }
    const loggedIn = self.iService.isLoggedIn();
    if (!loggedIn) {
      self.guarding = true;
      setTimeout(() => {
        self.loginDialog = self.dialog.open(LoginDialogComponent, {
          disableClose: true
        });

        self.loginDialog.afterClosed().subscribe(() => {
          setTimeout(() => {
            self.loginDialog = null;
            self.guarding = false;
          }, 300);
        });
      });
    }
    return loggedIn;
  }
}
