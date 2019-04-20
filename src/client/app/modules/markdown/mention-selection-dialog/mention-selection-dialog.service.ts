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
    const _this = this;
    _this.pressing = false;
    if (_this.longPress) {
      return;
    }
    _this.triggerListener.onTrigger();
  }

  private onKeyDown(e: MarkdownKeyboardEvent) {
    if (!isMentionTrigger(e)) {
      return;
    }
    const _this = this;
    _this.longPress = _this.pressing;
    _this.pressing = true;
  }

  get editorListener() {
    const _this = this;
    return {
      keyup: _this.onKeyUp.bind(_this),
      keydown: _this.onKeyDown.bind(_this),
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
    const _this = this;
    _this.onDialogClose = () => {
      _this.showing = false;
    };

    _this.timeoutTask = function() {
      const elapsed = Date.now() - _this.startTimestamp;
      const remainingTime = delay - elapsed;
      if (remainingTime > deviation) {
        return setTimeout(_this.timeoutTask, remainingTime);
      }
      if (_this.canceling) {
        _this.pending = false;
        _this.canceling = false;
        return;
      }
      _this.showDialog();
      _this.pending = false;
    };
  }

  onTrigger() {
    const _this = this;
    if (_this.showing) {
      return;
    }

    if (_this.pending) {
      _this.canceling = true;
      return;
    }

    _this.startTimestamp = Date.now();
    _this.pending = true;
    setTimeout(_this.timeoutTask, _this.delay);
  }
}

export class MentionSelectionDialogPopper extends MentionTriggerThrottle {
  constructor(private matDialog: MatDialog, private sourceElement: HTMLElement, private selectionListener: MentionSelectionListener) {
    super(180, 20);
  }

  protected showDialog(): void {
    const _this = this;
    const {matDialog} = _this;
    const userSelectionDialog = matDialog.open(MentionSelectionDialogComponent, {
      data: {
        anchor: _this.sourceElement.querySelector('.CodeMirror-cursor'),
        contextUsers: _this.selectionListener.contextUsers
      },
    });
    userSelectionDialog.componentInstance.selectionListener = _this.selectionListener;
    userSelectionDialog.afterClosed().subscribe(_this.onDialogClose);
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
