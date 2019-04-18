import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {I18nService} from "../../i18n/i18n.service";
import {MarkdownEditor, MarkdownService} from "../markdown.service";
import {MentionSelectionDialogService} from "../mention-selection-dialog/mention-selection-dialog.service";
import {MentionSelectionListener} from "../mention-selection-dialog/mention-selection-dialog.component";
import {UserNickname} from "../../../../../shared/interf";
import {MinimumUser} from "../../../../../shared/contracts";

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit, MentionSelectionListener {
  private editor: MarkdownEditor;

  @Input() noToolbar = false;
  @Input() placeholder = '';
  @Input() initialFocus = false;
  @Input() content = '';
  @Input() contextUsers: MinimumUser[] = [];

  private __disabled = false;

  @Input()
  set disabled(v: boolean) {
    if (v) {
      this.disableEditor();
    } else {
      this.enableEditor();
    }
  }

  disableEditor() {
    const self = this;
    if (self.__disabled) {
      return;
    }
    const {nativeElement} = self.hostElement;
    if (!nativeElement) {
      return;
    }

    const toolbar = nativeElement.querySelector('.te-toolbar-section');
    if (toolbar) {
      const buttons = toolbar.getElementsByTagName('button');
      if (buttons && buttons[1]) {
        buttons[1].click();
      }
      toolbar.style.display = 'none';
      self.__disabled = true;
    }
  }

  enableEditor() {
    const self = this;
    if (!self.__disabled) {
      return;
    }
    const {nativeElement} = self.hostElement;
    if (!nativeElement) {
      return;
    }

    const toolbar = nativeElement.querySelector('.te-toolbar-section');
    if (toolbar) {
      const buttons = toolbar.getElementsByTagName('button');
      if (buttons && buttons[0]) {
        buttons[0].click();
      }
      toolbar.style.display = 'block';
      self.__disabled = false;
    }
  }

  constructor(private hostElement: ElementRef,
              private i18Service: I18nService,
              private mk: MarkdownService,
              private mentionSelectionDialogService: MentionSelectionDialogService) {
  }


  onUserSelected(user: UserNickname): void {
    this.editor.mention(user);
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

  isEmpty() {
    try {
      const {editor} = this;
      const children = (editor as any).mdEditor.cm.doc.children as any[];
      for (let i = 0; i < children.length; ++i) {
        const {lines} = children[i];
        let line;
        for (let j = 0; j < lines.length; ++j) {
          line = lines[j];
          if (line && line.text) {
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      console.log(e);
    }
    return true;
  }
}
