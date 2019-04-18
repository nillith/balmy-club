import {$authorId, $mentionIds, INVALID_NUMERIC_ID, userObfuscator} from "../service/obfuscator.service";
import {MENTION_PATTERN} from "../../shared/constants";
import db from "../persistence/index";
import _ from 'lodash';
import {devOnly, isNumericId} from "../utils/index";
import {isString} from "util";
import {isValidPostContent, isValidStringId, isValidTimestamp} from "../../shared/utils";
import {DatabaseRecordBase} from "./model-base";

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

const assertSanitizeParams = devOnly(function(model: any, mentions: Mentions) {
  console.assert(isNumericId(model[$authorId]), `invalid authorId ${model[$authorId]}`);
  console.assert(model.content, `empty content`);
  console.assert(mentions && mentions.length, `empty mentions`);
  const mentionsMsg = `invalid mentions ${JSON.stringify(mentions)}`;
  for (let mention of mentions) {
    console.assert(isNumericId(mention.id), mentionsMsg);
    console.assert(isValidStringId(mention.obfuscatedId), mentionsMsg);
    console.assert(mention.nickname && isString(mention.nickname), mentionsMsg);
  }
});


export class TextContentRecord extends DatabaseRecordBase {
  [$authorId]: number;
  [$mentionIds]?: number[];
  content: string;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
  plusCount = 0;
  plusedByMe?: boolean;
  authorNickname?: string;
  authorAvatarUrl?: string;

  constructor(id: number, authorId: number, content: string, createdAt: number) {
    super(id);
    this.content = content;
    this.createdAt = createdAt;
    this[$authorId] = authorId;
  }
}

export const TextContentOutboundCloneFields = [
  'content', 'plusCount', 'createdAt', 'authorNickname', 'authorAvatarUrl', 'plusedByMe'
];


export class TextContentBuilder {
  [$authorId]: number;
  [$mentionIds]?: number[];
  content: string;
  updatedAt?: number;
  deletedAt?: number;
  plusCount = 0;


  constructor(authorId: number, content: string, public createdAt: number) {
    this[$authorId] = authorId;
    this.content = content;
  }

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
    return self.__sanitizeContentMentions(mentions, await getMentionableUsers(mentions, self[$authorId]));
  }
}


export const assertValidRawTextContent = devOnly(function(data: any) {
  console.assert(isNumericId(data.authorId), `invalid authorId: ${data.authorId}`);
  console.assert(isValidPostContent(data.content), `invalid content`);
  console.assert(isValidTimestamp(data.createdAt), `invalid timestamp ${data.createdAt}`);
  console.assert(data.mentionIds, `no mentionIds`);
  const ids = JSON.parse(data.mentionIds);
  for (const id of ids) {
    console.assert(isNumericId(id), `invalid mention id ${id}`);
  }
});

export interface RawTextContent {
  authorId: number;
  content: string;
  createdAt: number;
  mentionIds: string;
}
