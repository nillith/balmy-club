import {Component, Input, OnInit} from '@angular/core';
import {LoginWallService} from "../login-wall/login-wall.service";
import {MatDialog} from "@angular/material";
import {SettingService} from "../avatar-setting-dialog/setting.service";
import {IService} from "../../services/i.service";
import {NavEntry} from "../../../constants";
import {NotificationsApiService} from "../../api/notifications-api.service";
import {NotificationDialogService} from "../../modules/notification/notification-dialog/notification-dialog.service";

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
              public iService: IService,
              public notificationsApi: NotificationsApiService,
              public notificationsDialog: NotificationDialogService) {
  }

  ngOnInit(): void {
  }

}
