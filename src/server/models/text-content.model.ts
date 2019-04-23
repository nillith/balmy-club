import {$authorId, $mentionIds, INVALID_NUMERIC_ID, userObfuscator} from "../service/obfuscator.service";
import {MENTION_PATTERN} from "../../shared/constants";
import _ from 'lodash';
import {devOnly, isNumericId} from "../utils/index";
import {isValidPostContent, isValidTimestamp} from "../../shared/utils";
import {DatabaseRecordBase} from "./model-base";
import {UserModel} from "./user.model";

export interface Mention {
  nickname: string;
  obfuscatedId: string;
  userId: number;
}

function createMentionRegexp() {
  return new RegExp(MENTION_PATTERN, 'g');
}

export function extractMentions(content: string): Mention[] {
  const regex = createMentionRegexp();
  const results: Mention[] = [];
  let match: RegExpExecArray | null;
  while (match = regex.exec(content)) {
    const obfuscatedId = match[2];
    const userId = userObfuscator.unObfuscate(match[2]);
    if (INVALID_NUMERIC_ID !== userId) {
      results.push({
        obfuscatedId,
        userId,
        nickname: match[1]
      });
    }
  }
  return results;
}


export async function sanitizeMentions(content: string, authorId: number): Promise<[string, number[]]> {
  let mentions = extractMentions(content);
  const idNicknameMap: any = {};
  const mentionIds: number[] = [];
  if (!_.isEmpty(mentions)) {
    const mentionableUsers = await UserModel.findMentionableUsers(_.map(mentions, m => m.userId), authorId);
    _.each(mentionableUsers, (user) => {
      idNicknameMap[user.id] = user.nickname;
    });
    for (const m of mentions) {
      const nickname = idNicknameMap[m.userId];
      if (nickname) {
        idNicknameMap[m.obfuscatedId] = nickname;
        mentionIds.push(m.userId);
      }
    }
  }
  content = content.replace(createMentionRegexp(), (fullMatch: string, nickname: string, obfuscatedId: string) => {
    nickname = idNicknameMap[obfuscatedId];
    if (!nickname) {
      return '';
    } else {
      return `+[${nickname}](${obfuscatedId})`;
    }
  });
  return [content, mentionIds];
}


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
  authorId: number;
  [$mentionIds]: number[];
  mentionIds: string = '[]';
  content: string;
  updatedAt?: number;
  deletedAt?: number;
  plusCount = 0;


  constructor(authorId: number, content: string, public createdAt: number) {
    this.authorId = authorId;
    this.content = content;
  }

  async prepare() {
    const _this = this;
    [_this.content, _this[$mentionIds]] = await sanitizeMentions(_this.content, _this.authorId);
    _this.mentionIds = JSON.stringify(_this[$mentionIds]);
  }

  toJSON() {
    throw Error('Not Allowed!');
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
