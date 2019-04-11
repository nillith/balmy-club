import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {
  UserSelectionDialogComponent,
  UserSelectionListener
} from "../shared/dialogs/user-selection-dialog/user-selection-dialog.component";
import {IService} from "./api/i.service";

const delay = 180;
const deviation = 20;


export class UserSelectionDialogManager {
  private userSelectionDialog: MatDialogRef<UserSelectionDialogComponent>;
  private pending = false;
  private canceling = false;
  private startTimestamp: number;
  private timeoutTask: () => void;
  private dialogCloseHandler: () => void;

  constructor(matDialog: MatDialog, private sourceElement: HTMLElement, private selectionListener: UserSelectionListener) {
    if (!sourceElement || !(sourceElement instanceof HTMLElement)) {
      throw Error(`Invalid sourceElement`);
    }
    const self = this;

    self.dialogCloseHandler = () => {
      self.userSelectionDialog = undefined;
    };

    self.timeoutTask = function() {
      const elapsed = Date.now() - self.startTimestamp;
      const remainingTime = delay - elapsed;
      if (remainingTime > deviation) {
        return setTimeout(self.timeoutTask, remainingTime);
      }
      if (self.canceling) {
        self.pending = false;
        self.canceling = false;
        return;
      }
      self.userSelectionDialog = matDialog.open(UserSelectionDialogComponent, {
        data: {
          anchor: self.sourceElement.querySelector('.CodeMirror-cursor')
        },
      });
      self.userSelectionDialog.componentInstance.selectionListener = self.selectionListener;
      self.userSelectionDialog.afterClosed().subscribe(self.dialogCloseHandler);
      self.pending = false;
    };
  }

  tryPopup() {
    const self = this;
    if (self.userSelectionDialog) {
      return;
    }

    if (self.pending) {
      self.canceling = true;
      return;
    }

    self.startTimestamp = Date.now();

    self.pending = true;
    setTimeout(self.timeoutTask, delay);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserSelectionDialogManagerFactoryService {

  constructor(private dialog: MatDialog, private iService: IService) {
    document.body.addEventListener('mouseover', function(e: MouseEvent) {
      const {fromElement} = e;
      if (!fromElement) {
        return;
      }
      switch (fromElement.tagName) {
        case "P":
          console.log(document.elementFromPoint(e.clientX, e.clientY));
          break;
        case "A":
          console.log(fromElement.tagName);
          console.log(e);
      }

      document.body.addEventListener('mouseout', function() {
        const {fromElement} = e;
        if (!fromElement) {
          return;
        }
        switch (fromElement.tagName) {
          case "P":
            console.log(document.elementFromPoint(e.clientX, e.clientY));
            break;
          case "A":
            console.log(fromElement.tagName);
            console.log(e);
      });
      // if (fromElement.tagName !== 'P') {
      // }
    });
  }

  create(sourceElement: HTMLElement, selectionListener: UserSelectionListener) {
    return new UserSelectionDialogManager(this.dialog, sourceElement, selectionListener);
  }

}
