import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {UserNickname} from "../../../../../shared/interf";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {IService} from "../../../services/i.service";
import {makeBackdropTransparent} from "../../../../utils/index";
import {MinimumUser} from "../../../../../shared/contracts";

export interface MentionSelectionListener {
  contextUsers: MinimumUser[];

  onUserSelected(user: UserNickname): void;
}

const gap = 4;

@Component({
  selector: 'app-mention-selection-dialog',
  templateUrl: './mention-selection-dialog.component.html',
  styleUrls: ['./mention-selection-dialog.component.scss']
})
export class MentionSelectionDialogComponent implements OnInit {

  allUsers: MinimumUser[] = [];
  contextUsers: MinimumUser[] = [];
  filteredUsers?: UserNickname[];
  private anchor: HTMLElement;
  selectionListener?: MentionSelectionListener;
  selected = false;

  constructor(public hostElement: ElementRef,
              public dialogRef: MatDialogRef<MentionSelectionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: {
                anchor: HTMLElement,
                contextUsers: MinimumUser[]
              },
              public i: IService) {
    const _this = this;
    _this.anchor = data.anchor;
    _this.contextUsers = data.contextUsers;
    _this.allUsers = _this.contextUsers.concat(_this.i.allUsers);
    _this.filteredUsers = _this.allUsers;
  }


  ngOnInit() {
    const {nativeElement} = this.hostElement;
    const {width, height} = nativeElement.getBoundingClientRect();
    const {anchor, dialogRef} = this;
    const rect = anchor.getBoundingClientRect();

    let right = Math.floor(rect.right) + width + gap;
    let bottom = Math.floor(rect.bottom) + height;
    const {innerWidth, innerHeight} = window;

    if (right > innerWidth) {
      right = innerWidth - gap;
    }

    if (bottom > innerHeight) {
      bottom = innerHeight - gap;
    }

    dialogRef.updatePosition({
      right: `${right}px`,
      top: `${bottom - height}px`,
      left: `${right - width}px`,
      bottom: `${bottom}px`,
    });

    makeBackdropTransparent(nativeElement);
  }

  onInputChange(value) {
    const _this = this;
    if (!value) {
      _this.filteredUsers = _this.allUsers;
      return;
    }
    try {
      const reg = new RegExp(value, 'i');
      _this.filteredUsers = _this.allUsers.filter((u) => {
        return reg.test(u.nickname);
      });
    } catch (e) {

    }
  }

  onListButtonClick(user) {
    const _this = this;
    if (_this.selected) {
      return;
    }
    _this.selected = true;
    _this.dialogRef.close();
    if (_this.selectionListener) {
      setTimeout(() => {
        _this.selectionListener.onUserSelected(user);
      });
    }
  }
}
