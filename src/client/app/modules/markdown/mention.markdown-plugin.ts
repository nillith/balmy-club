import MarkdownIt from 'markdown-it';
import Token from "markdown-it/lib/token";
import Renderer from "markdown-it/lib/renderer";
import StateInline from "markdown-it/lib/rules_inline/state_inline";
import {MENTION_PATTERN} from "../../../../shared/constants";

const RULE_NAME = 'mention';
const PATTERN = new RegExp(MENTION_PATTERN, 'y');

export const MentionPlugin = function(markdownIt: MarkdownIt) {
  const mentionRenderer = function(tokens: Token[], index: number, options: any, env: any, _this: Renderer) {
    const token = tokens[index];
    if (!token) {
      return;
    }
    return `<a class="app-nickname-link" href="u/${token.content}" target="_blank" data-user-id="${token.content}">+${token.info}</a>`;
  };

  const parser = function(state: StateInline, silent?: boolean): boolean | void {
    PATTERN.lastIndex = state.pos;
    const {src} = state;
    const match = src.match(PATTERN);
    if (!match) {
      return false;
    }
    const [total, name, data] = match;

    if (!silent) {
      state.pos = state.pos + total.length;
      const token = state.push(RULE_NAME, 'a', 0);
      token.content = data;
      token.info = name;
      token.level = state.level;
    }
    return true;
  };
  markdownIt.renderer.rules[RULE_NAME] = mentionRenderer;
  markdownIt.inline.ruler.before('text', RULE_NAME, parser);
};
