import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {IService} from "../../services/i.service";
import {makeBackdropTransparent} from "../../../utils/index";
import {StringIds} from "../../modules/i18n/translations/string-ids";

@Component({
  selector: 'app-avatar-setting-dialog',
  templateUrl: './avatar-setting-dialog.component.html',
  styleUrls: ['./avatar-setting-dialog.component.scss']
})
export class AvatarSettingDialogComponent implements OnInit {

  anchor: HTMLElement;
  StringIds = StringIds;

  constructor(public hostElement: ElementRef,
              public dialogRef: MatDialogRef<AvatarSettingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { anchor: HTMLElement },
              public i: IService) {
    this.anchor = data.anchor;
  }

  ngOnInit() {
    const {nativeElement} = this.hostElement;
    const {width, height} = nativeElement.getBoundingClientRect();
    const {anchor, dialogRef} = this;
    const rect = anchor.getBoundingClientRect();
    const top = Math.floor(rect.bottom + 10);
    const right = Math.floor(rect.right - 24);
    dialogRef.updatePosition({
      right: `${right}px`,
      top: `${top}px`,
      left: `${right - width}px`,
      bottom: `${top + height}px`,
    });

    makeBackdropTransparent(nativeElement);
  }

  logout() {
    const _this = this;
    _this.dialogRef.afterClosed().subscribe(() => {
      setTimeout(function() {
        _this.i.logout();
      }, 200);
    });
    _this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
