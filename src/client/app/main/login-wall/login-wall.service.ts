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
    const _this = this;
    if (_this.guarding) {
      return false;
    }
    const loggedIn = _this.iService.isLoggedIn();
    if (!loggedIn) {
      _this.guarding = true;
      setTimeout(() => {
        _this.loginDialog = _this.dialog.open(LoginDialogComponent, {
          disableClose: true
        });

        _this.loginDialog.afterClosed().subscribe(() => {
          setTimeout(() => {
            _this.loginDialog = null;
            _this.guarding = false;
          }, 300);
        });
      });
    }
    return loggedIn;
  }
}
