import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../service/auth.service";
import {MatDialog, MatDialogRef} from "@angular/material";
import {LoginDialogComponent} from "../../dialogs/login-dialog/login-dialog.component";

export interface NavEntry {
  readonly name: string;
  readonly icon: string;
  readonly link: string;
}

@Component({
  selector: 'app-main-nav-view',
  templateUrl: './main-nav-view.component.html',
  styleUrls: ['./main-nav-view.component.scss']
})
export class MainNavViewComponent implements OnInit {
  @Input() entries: NavEntry[];

  loginDialog: MatDialogRef<LoginDialogComponent>;

  constructor(public authService: AuthService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    const self = this;
    if (!self.authService.isLoggedIn()) {
      setTimeout(() => {
        self.loginDialog = self.dialog.open(LoginDialogComponent, {
          disableClose: true
        });
      });
    }
  }
}
