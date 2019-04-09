import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {LoginDialogComponent} from "../shared/dialogs/login-dialog/login-dialog.component";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService {

  loginDialog: MatDialogRef<LoginDialogComponent>;
  private pending = false;

  constructor(public dialog: MatDialog, private authService: AuthService) {
  }

  isLoggedIn() {
    const self = this;
    const loggedIn = self.authService.isLoggedIn();
    if (!loggedIn && !self.pending && !self.loginDialog) {
      self.pending = true;
      setTimeout(() => {
        self.loginDialog = self.dialog.open(LoginDialogComponent, {
          disableClose: true
        });

        self.loginDialog.afterClosed().subscribe(() => {
          setTimeout(() => {
            self.loginDialog = null;
          }, 300);
        });
        self.pending = false;
      });
    }
    return loggedIn;
  }
}
