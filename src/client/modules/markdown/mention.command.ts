import {idPattern, nicknamePattern, mentionTrigger} from "../../../shared/constants";
import Editor from 'tui-editor';

export const MentionCommandName = 'Mention';

export interface Mentionee {
  id: string;
  nickname: string;
}

const clonePos = (function() {
  const posFields = ['line', 'ch'];
  return function(pos: any) {
    const result = {};
    for (const f of posFields) {
      result[f] = pos[f];
    }
    return result;
  };
})();

const nicknameRegExp = new RegExp(`^${nicknamePattern}$`);
const idRegExp = new RegExp(`^${idPattern}$`);
const MentionCommandHandler = {
  name: MentionCommandName,
  exec(mde: any, mentionee: Mentionee) {
    const {nickname, id} = mentionee;
    if (!nicknameRegExp.test(nickname) || !idRegExp.test(id)) {
      return;
    }
    const cm = mde.getEditor();
    const doc = cm.getDoc();
    const {from, to} = mde.getCurrentRange();
    let prefix = mentionTrigger;
    if (from.ch > 0) {
      const line = doc.getLine(from.line);
      if (line[from.ch - 1] === prefix) {
        prefix = '';
      }
    }
    doc.replaceRange(`${prefix}[${nickname}](${id})`, clonePos(from), clonePos(to));
    cm.focus();
  }
};

export const MentionCommand = Editor.CommandManager.command('markdown', MentionCommandHandler);

