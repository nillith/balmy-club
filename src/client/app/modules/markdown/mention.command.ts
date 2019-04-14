import {ID_PATTERN, NICKNAME_PATTERN, MENTION_TRIGGER} from "../../../../shared/constants";
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

const nicknameRegExp = new RegExp(`^${NICKNAME_PATTERN}$`);
const idRegExp = new RegExp(`^${ID_PATTERN}$`);
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
    let prefix = MENTION_TRIGGER;
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

