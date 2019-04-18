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
    const self = this;
    self.anchor = data.anchor;
    self.contextUsers = data.contextUsers;
    self.allUsers = self.contextUsers.concat(self.i.allUsers);
    self.filteredUsers = self.allUsers;
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
    const self = this;
    if (!value) {
      self.filteredUsers = self.allUsers;
      return;
    }
    try {
      const reg = new RegExp(value, 'i');
      self.filteredUsers = self.allUsers.filter((u) => {
        return reg.test(u.nickname);
      });
    } catch (e) {

    }
  }

  onListButtonClick(user) {
    const self = this;
    if (self.selected) {
      return;
    }
    self.selected = true;
    self.dialogRef.close();
    if (self.selectionListener) {
      setTimeout(() => {
        self.selectionListener.onUserSelected(user);
      });
    }
  }
}
