import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material";
import {MentionSelectionDialogComponent, MentionSelectionListener} from "./mention-selection-dialog.component";
import {IService} from "../../../services/i.service";
import {MENTION_TRIGGER} from "../../../../../shared/constants";


interface MarkdownKeyboardEvent {
  data: KeyboardEvent;
}

const isMentionTrigger = function(e: MarkdownKeyboardEvent) {
  const {data} = e;
  return data && data.key === MENTION_TRIGGER;
};

interface MentionTriggerListener {
  onTrigger(): void;
}

class MentionTriggerResolver {
  private pressing = false;
  private longPress = false;

  constructor(private triggerListener: MentionTriggerListener) {
  }

  private onKeyUp(e: MarkdownKeyboardEvent) {
    if (!isMentionTrigger(e)) {
      return;
    }
    const self = this;
    self.pressing = false;
    if (self.longPress) {
      return;
    }
    self.triggerListener.onTrigger();
  }

  private onKeyDown(e: MarkdownKeyboardEvent) {
    if (!isMentionTrigger(e)) {
      return;
    }
    const self = this;
    self.longPress = self.pressing;
    self.pressing = true;
  }

  get editorListener() {
    const self = this;
    return {
      keyup: self.onKeyUp.bind(self),
      keydown: self.onKeyDown.bind(self),
    };
  }
}

abstract class MentionTriggerThrottle implements MentionTriggerListener {
  private showing = false;
  private pending = false;
  private canceling = false;
  private startTimestamp: number;
  private timeoutTask: () => void;
  protected onDialogClose: () => void;

  protected abstract showDialog(): void;

  constructor(private delay: number, deviation: number) {
    const self = this;
    self.onDialogClose = () => {
      self.showing = false;
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
      self.showDialog();
      self.pending = false;
    };
  }

  onTrigger() {
    const self = this;
    if (self.showing) {
      return;
    }

    if (self.pending) {
      self.canceling = true;
      return;
    }

    self.startTimestamp = Date.now();
    self.pending = true;
    setTimeout(self.timeoutTask, self.delay);
  }
}

export class MentionSelectionDialogPopper extends MentionTriggerThrottle {
  constructor(private matDialog: MatDialog, private sourceElement: HTMLElement, private selectionListener: MentionSelectionListener) {
    super(180, 20);
  }

  protected showDialog(): void {
    const self = this;
    const {matDialog} = self;
    const userSelectionDialog = matDialog.open(MentionSelectionDialogComponent, {
      data: {
        anchor: self.sourceElement.querySelector('.CodeMirror-cursor'),
        contextUsers: self.selectionListener.contextUsers
      },
    });
    userSelectionDialog.componentInstance.selectionListener = self.selectionListener;
    userSelectionDialog.afterClosed().subscribe(self.onDialogClose);
  }
}

@Injectable({
  providedIn: 'root'
})
export class MentionSelectionDialogService {

  constructor(private dialog: MatDialog, private iService: IService) {
  }

  createEditorListener(sourceElement: HTMLElement, selectionListener: MentionSelectionListener) {
    const popper = new MentionSelectionDialogPopper(this.dialog, sourceElement, selectionListener);
    const resolver = new MentionTriggerResolver(popper);
    return resolver.editorListener;
  }
}
