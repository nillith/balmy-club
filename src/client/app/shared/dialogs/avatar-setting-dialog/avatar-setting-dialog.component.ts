import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {IService} from "../../../services/api/i.service";
import {makeBackdropTransparent} from "../../../../utils/index";

@Component({
  selector: 'app-avatar-setting-dialog',
  templateUrl: './avatar-setting-dialog.component.html',
  styleUrls: ['./avatar-setting-dialog.component.scss']
})
export class AvatarSettingDialogComponent implements OnInit {

  anchor: HTMLElement;

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
    const self = this;
    self.dialogRef.afterClosed().subscribe(() => {
      setTimeout(function() {
        self.i.logout();
      }, 200);
    });
    self.dialogRef.close();
  }

}
