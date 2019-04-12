import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {I18nServiceService} from "../../../services/i18n-service.service";
import {MarkdownEditor, MarkdownService} from "../markdown.service";
import {MentionSelectionDialogService} from "../mention-selection-dialog/mention-selection-dialog.service";
import {MentionSelectionListener} from "../mention-selection-dialog/mention-selection-dialog.component";
import {UserNickname} from "../../../../../shared/interf";

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

  @Input() noToolbar = false;
  @Input() placeholder = '';
  @Input() initialFocus = false;
  @Input() content = '';

  constructor(private hostElement: ElementRef,
              private i18Service: I18nServiceService,
              private mk: MarkdownService,
              private mentionSelectionDialogService: MentionSelectionDialogService) {
  }


  ngOnInit() {
    const self = this;
    const {nativeElement} = self.hostElement;
    (window as any).MD = self.editor = self.mk.createEditor({
      el: nativeElement,
      events: self.mentionSelectionDialogService.createEditorListener(nativeElement, self),
      initialValue: self.content,
      toolbarItems: self.noToolbar ? [] : undefined,
      placeholder: self.placeholder,
      maxHeight: '300px',
    });

    const sizer = nativeElement.querySelector('.CodeMirror-sizer');
    sizer.style.minHeight = '1em';

    if (self.initialFocus) {
      self.editor.focus();
    }
  }


  get markdown(): string {
    return this.editor.getMarkdown();
  }
}
