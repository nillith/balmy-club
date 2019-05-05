import {INVALID_NUMERIC_ID, userObfuscator} from "../service/obfuscator.service";
import {assert} from 'chai';
import {
  extractMentions,
  Mention,
  TextContentBuilder,
} from "./text-content.model";
import {utcTimestamp} from "../../shared/utils";

type Mentions = Mention[];

const createValidMentions = function() {
  const results: any[] = [
    {nickname: 'Mike', userId: 1},
    {nickname: 'Jay', userId: 2},
    {nickname: 'Jim', userId: 3}
  ];

  for (let e of results) {
    e.obfuscatedId = userObfuscator.obfuscate(e.userId);
  }

  return results as Mentions;
};

const makeObfuscatedMentions = function(mentions: Mentions) {
  for (const m of mentions) {
    delete m.userId;
  }
};

describe('TextContentModel', () => {
  let validMentions: Mentions;
  let obfuscatedMentions: Mentions;
  let content: string;


  const isNonEmptySameMentions = function(m1: Mentions, m2: Mentions) {
    if (m1.length < 1) {
      return false;
    }
    if (m1.length !== m2.length) {
      return false;
    }
    assert.isAtLeast(m1.length, 1);
    assert.strictEqual(m1.length, m2.length);
    for (const m of m1) {
      if (!m2.find((e => {
          return e.userId === m.userId && e.nickname === m.nickname && e.obfuscatedId === m.obfuscatedId;
        }))) {
        return false;
      }
    }

    for (const m of m2) {
      if (!m1.find((e => {
          return e.userId === m.userId && e.nickname === m.nickname && e.obfuscatedId === m.obfuscatedId;
        }))) {
        return false;
      }
    }
    return true;
  };

  beforeEach(() => {
    validMentions = createValidMentions();
    obfuscatedMentions = createValidMentions();
    makeObfuscatedMentions(obfuscatedMentions);
    for (const m of obfuscatedMentions) {
      assert.isUndefined(m.userId);
    }

    assert.isTrue(isNonEmptySameMentions(validMentions, validMentions));
    assert.isFalse(isNonEmptySameMentions(validMentions, obfuscatedMentions));
    content = validMentions.map((m) => {
      return `+[${m.nickname}](${m.obfuscatedId})`;
    }).join('\\n## blahnshouen');
  });

  it('should unObfuscate mention ids', () => {
    const mentions = extractMentions (content);
    for (const m of mentions) {
      assert.isDefined(m.userId);
      assert.notEqual(m.userId, INVALID_NUMERIC_ID);
    }
    assert.strictEqual(mentions.length, validMentions.length);
  });

});
