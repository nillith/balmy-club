import {Component, ElementRef, OnInit} from '@angular/core';
import {I18nServiceService} from "../../../services/i18n-service.service";
import {MarkdownEditor, MarkdownService} from "../markdown.service";
import {
  MentionSelectionDialogManager,
  MentionSelectionDialogManagerFactoryService
} from "../mention-selection-dialog/mention-selection-dialog.manager.factory.service";
import {mentionTrigger} from "../../../../shared/constants";
import {MentionSelectionListener} from "../mention-selection-dialog/mention-selection-dialog.component";
import {UserNickname} from "../../../../shared/interf";


@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit, MentionSelectionListener {
  onUserSelected(user: UserNickname): void {
    this.editor.mention(user);
  }

  private editor: MarkdownEditor;
  private userDialog?: MentionSelectionDialogManager;
  private pressed = false;
  private longPress = false;

  constructor(private hostElement: ElementRef,
              private i18Service: I18nServiceService,
              private mk: MarkdownService,
              private userDialogFactory: MentionSelectionDialogManagerFactoryService) {
  }

  onKeyUp(e) {
    const self = this;
    self.pressed = false;
    if (self.longPress) {
      return;
    }
    const {data} = e;
    if (data && data.key === mentionTrigger) {
      self.userDialog.tryPopup();
    }
  }

  onKeyDown() {
    const self = this;
    self.longPress = self.pressed;
    self.pressed = true;
  }

  ngOnInit() {
    const self = this;
    const {nativeElement} = self.hostElement;
    (window as any).MD = self.editor = self.mk.createEditor({
      el: nativeElement,
      events: {
        keyup: self.onKeyUp.bind(self),
        keydown: self.onKeyDown.bind(self),
      },
      placeholder: "Content",
    });

    self.userDialog = self.userDialogFactory.create(nativeElement, self);
  }


  get markdown(): string {
    return this.editor.getMarkdown();
  }

}
