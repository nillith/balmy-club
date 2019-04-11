import {Component, Input, OnInit} from '@angular/core';
import {LoginWallService} from "../login-wall/login-wall.service";
import {MatDialog} from "@angular/material";
import {SettingService} from "../../services/setting.service";
import {IService} from "../../api/i.service";

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
              public loginWallService: LoginWallService,
              public settingService: SettingService,
              public iService: IService) {
  }

  ngOnInit(): void {
  }

}
