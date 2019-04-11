import {Component, Input, OnInit} from '@angular/core';
import {LoginGuardService} from "../../../services/login-guard.service";
import {MatDialog} from "@angular/material";
import {SettingService} from "../../../services/setting.service";
import {IService} from "../../../services/api/i.service";

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

  constructor(public dialog: MatDialog,
              public loginGuard: LoginGuardService,
              public settingService: SettingService,
              public iService: IService) {
  }

  ngOnInit(): void {
  }

}
