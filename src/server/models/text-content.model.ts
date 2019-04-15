import {ModelBase} from "./model-base";
import {
  $authorId,
  $mentionIds,
  INVALID_NUMERIC_ID,
  userObfuscator
} from "../service/obfuscator.service";
import {MENTION_PATTERN} from "../../shared/constants";
import db from "../persistence/index";
import _ from 'lodash';
import {devOnly, isNumericId} from "../utils/index";
import {isString} from "util";
import {isValidStringId} from "../../shared/utils";

export interface Mention {
  nickname: string;
  obfuscatedId: string;
  id: number;
}

export type Mentions = Mention[];

export function unObfuscateIdAnReturnValidMentions(mentions: Mentions): Mentions {
  for (const m of mentions) {
    m.id = userObfuscator.unObfuscate(m.obfuscatedId);
  }
  return mentions.filter((m) => {
    const id = m.id;
    return id && INVALID_NUMERIC_ID !== id;
  });
}

const assertValidObfuscatedIdNicknameMap = devOnly(function(obfuscatedIdNicknameMap: any) {
  console.assert(obfuscatedIdNicknameMap, `no obfuscatedIdNicknameMap`);
  const keys = Object.keys(obfuscatedIdNicknameMap);
  console.assert(keys.length, `empty iidNicknameMap`);
  let hasMap = false;
  for (const key of keys) {
    if (isValidStringId(key) && obfuscatedIdNicknameMap[key]) {
      hasMap = true;
      break;
    }
  }
  console.assert(hasMap, `no valid map`);
});

export function sanitizeContentMentions(content: string, obfuscatedIdNicknameMap: any) {
  assertValidObfuscatedIdNicknameMap(obfuscatedIdNicknameMap);
  return content.replace(createMentionRegexp(), (fullMatch: string, nickname: string, obfuscatedId: string) => {
    nickname = obfuscatedIdNicknameMap[obfuscatedId];
    if (!nickname) {
      return '';
    } else {
      return `+[${nickname}](${obfuscatedId})`;
    }
  });
}

export interface MentionableUsers {
  [index: number]: { id: number, nickname: string };

  length: number;
}

export async function getMentionableUsers(mentions: Mentions, mentionerId: number): Promise<MentionableUsers> {
  const [rows] = await db.query(`SELECT Users.id, Users.nickname FROM Users WHERE Users.id IN (:userIds) AND Users.id NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :mentionerId)`, {
    userIds: mentions.map(m => m.id),
    mentionerId
  });
  return rows as any as MentionableUsers;
}

function createMentionRegexp() {
  return new RegExp(MENTION_PATTERN, 'g');
}

const assertSanitizeParams = devOnly(function(model: TextContentModel, mentions: Mentions) {
  console.assert(isNumericId(model.authorId), `invalid authorId ${model.authorId}`);
  console.assert(model.content, `empty content`);
  console.assert(mentions && mentions.length, `empty mentions`);
  const mentionsMsg = `invalid mentions ${JSON.stringify(mentions)}`;
  for (let mention of mentions) {
    console.assert(isNumericId(mention.id), mentionsMsg);
    console.assert(isValidStringId(mention.obfuscatedId), mentionsMsg);
    console.assert(mention.nickname && isString(mention.nickname), mentionsMsg);
  }
});

export class TextContentModel extends ModelBase {
  authorId?: number | string;
  [$authorId]?: string;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number;
  mentionIds?: (number[]) | (string[]);
  plusCount?: number;
  [$mentionIds]?: string[];

  extractMentionsFromContent(): Mentions {
    const self = this;
    const {content} = self;
    if (!content) {
      return [] as Mentions;
    }
    const regex = createMentionRegexp();
    const results: Mentions = [];
    let match: RegExpExecArray | null;
    while (match = regex.exec(content)) {
      results.push({
        nickname: match[1],
        obfuscatedId: match[2]
      } as Mention);
    }
    return unObfuscateIdAnReturnValidMentions(results);
  }

  __sanitizeContentMentions(mentions: Mentions, mentionableUsers: MentionableUsers) {
    const self = this;
    if (_.isEmpty(mentionableUsers)) {
      return [] as Mentions;
    }
    const idNicknameMap: any = {};
    _.each(mentionableUsers as any[], (row) => {
      idNicknameMap[row.id] = row.nickname;
    });

    mentions = mentions.filter((m: Mention) => {
      m.nickname = idNicknameMap[m.id!];
      idNicknameMap[m.obfuscatedId] = m.nickname;
      return !!m.nickname;
    });

    if (!_.isEmpty(mentions)) {
      self.content = sanitizeContentMentions(self.content!, idNicknameMap);
    }
    return mentions;
  }

  async sanitizeContentMentions(mentions: Mentions): Promise<Mentions> {
    const self = this;
    assertSanitizeParams(self, mentions);
    return self.__sanitizeContentMentions(mentions, await getMentionableUsers(mentions, self.authorId as number));
  }
}

