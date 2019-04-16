import {Injectable} from '@angular/core';
import Editor from 'tui-editor';
import {I18nService} from "../i18n/i18n.service";
import {MentionPlugin} from "./mention.markdown-plugin";
import {MentionCommand, MentionCommandName, Mentionee} from "./mention.command";

Editor.markdownit.use(MentionPlugin);
Editor.markdownitHighlight.use(MentionPlugin);
type EditorOrViewer = ReturnType<typeof Editor.factory>;

function isEditor(arg: any): arg is Editor {
  return false;
}

function returnNullableViewer(arg: EditorOrViewer) {
  if (isEditor(arg)) {
    return arg;
  }
  return null;
}

type NullableViewer = ReturnType<typeof returnNullableViewer>;

function returnMarkdownViewer(arg: NullableViewer) {
  return arg!;
}

export type MarkdownViewer = ReturnType<typeof returnMarkdownViewer>;


const setIfUndefined = function(obj, name, v) {
  if (undefined === obj[name]) {
    obj[name] = v;
  }
};

export interface MarkdownEditor extends Editor {
  exec(cmd: string, payload: any): void;

  addCommand(...args: any[]): any;

  mention(mentionee: Mentionee): any;
}

const mention = function(this: MarkdownEditor, mentionee: Mentionee) {
  this.exec(MentionCommandName, mentionee);
};

(Editor.prototype as any).mention = mention;

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {

  constructor(private i18Service: I18nService) {
  }

  private prepareOptions(option: any) {
    const self = this;
    option.language = option.language || self.i18Service.language.replace(/-.*$/, '');
    option.usageStatistics = false;
    setIfUndefined(option, 'usageStatistics', false);
    setIfUndefined(option, 'hideModeSwitch', true);
    setIfUndefined(option, 'height', 'auto');
    setIfUndefined(option, 'minHeight', '1em');
    setIfUndefined(option, 'initialEditType', 'markdown');
    return option;
  }

  createEditor(option: any): MarkdownEditor {
    option = this.prepareOptions(option);
    const editor = Editor.factory(option) as MarkdownEditor;
    editor.addCommand(MentionCommand);
    return editor;
  }

  createViewer(option: any) {
    option = this.prepareOptions(option);
    option.viewer = true;
    const r = Editor.factory(option) as MarkdownViewer;
    return r;
  }
}
