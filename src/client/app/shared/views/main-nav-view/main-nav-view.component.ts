import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../service/auth.service";
import {LoginGuardService} from "../../../service/login-guard.service";

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

  // loginDialog: MatDialogRef<LoginDialogComponent>;

  constructor(public authService: AuthService, public loginGuard: LoginGuardService) {
  }

  ngOnInit(): void {
    // const self = this;
    // if (!self.authService.isLoggedIn()) {
    //   setTimeout(() => {
    //     self.loginDialog = self.dialog.open(LoginDialogComponent, {
    //       disableClose: true
    //     });
    //   });
    // }
  }
}
