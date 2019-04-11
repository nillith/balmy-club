import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {
  MentionSelectionDialogComponent,
  MentionSelectionListener
} from "./mention-selection-dialog.component";
import {IService} from "../../../api/i.service";

const delay = 180;
const deviation = 20;


export class MentionSelectionDialogManager {
  private userSelectionDialog: MatDialogRef<MentionSelectionDialogComponent>;
  private pending = false;
  private canceling = false;
  private startTimestamp: number;
  private timeoutTask: () => void;
  private dialogCloseHandler: () => void;

  constructor(matDialog: MatDialog, private sourceElement: HTMLElement, private selectionListener: MentionSelectionListener) {
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
      self.userSelectionDialog = matDialog.open(MentionSelectionDialogComponent, {
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
export class MentionSelectionDialogManagerFactoryService {

  constructor(private dialog: MatDialog, private iService: IService) {
  }

  create(sourceElement: HTMLElement, selectionListener: MentionSelectionListener) {
    return new MentionSelectionDialogManager(this.dialog, sourceElement, selectionListener);
  }

}
