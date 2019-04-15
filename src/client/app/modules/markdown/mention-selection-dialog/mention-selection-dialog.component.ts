import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {UserNickname} from "../../../../../shared/interf";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {IService} from "../../../services/i.service";
import {makeBackdropTransparent} from "../../../../utils/index";

export interface MentionSelectionListener {
  onUserSelected(user: UserNickname): void;
}

const gap = 4;

@Component({
  selector: 'app-mention-selection-dialog',
  templateUrl: './mention-selection-dialog.component.html',
  styleUrls: ['./mention-selection-dialog.component.scss']
})
export class MentionSelectionDialogComponent implements OnInit {

  allUsers: UserNickname[] = [
    {
      id: 'b1f7fe3e36e5802ea357744104734340',
      nickname: 'Mike',
    },
    {
      id: 'ec25aafdb1ca400b4f4b75cc33519b34',
      nickname: 'Jim',
    },
    {
      id: 'ff7dccafda927571b09a7e21bc4041ea',
      nickname: 'Mary',
    },
    {
      id: 'b1f7fe3e36e5802ea357744104734340',
      nickname: 'Tom',
    },
    {
      id: 'ec25aafdb1ca400b4f4b75cc33519b34',
      nickname: 'Jay',
    },
    {
      id: 'ff7dccafda927571b09a7e21bc4041ea',
      nickname: 'Malina',
    }
  ];
  filteredUsers?: UserNickname[];
  private anchor: HTMLElement;
  selectionListener?: MentionSelectionListener;
  selected = false;

  constructor(public hostElement: ElementRef,
              public dialogRef: MatDialogRef<MentionSelectionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { anchor: HTMLElement },
              public i: IService) {
    this.anchor = data.anchor;
    this.filteredUsers = this.allUsers;
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
