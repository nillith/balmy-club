import {INVALID_NUMERIC_ID, userObfuscator} from "../service/obfuscator.service";
import {assert} from 'chai';
import {
  MentionableUsers,
  Mentions,
  sanitizeContentMentions,
  TextContentModel,
  unObfuscateIdAnReturnValidMentions
} from "./text-content.model";

const createValidMentions = function() {
  const results: any[] = [
    {nickname: 'Mike', id: 1},
    {nickname: 'Jay', id: 2},
    {nickname: 'Jim', id: 3}
  ];

  for (let e of results) {
    e.obfuscatedId = userObfuscator.obfuscate(e.id);
  }

  return results as Mentions;
};

const makeObfuscatedMentions = function(mentions: Mentions) {
  for (const m of mentions) {
    delete m.id;
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
          return e.id === m.id && e.nickname === m.nickname && e.obfuscatedId === m.obfuscatedId;
        }))) {
        return false;
      }
    }

    for (const m of m2) {
      if (!m1.find((e => {
          return e.id === m.id && e.nickname === m.nickname && e.obfuscatedId === m.obfuscatedId;
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
      assert.isUndefined(m.id);
    }

    assert.isTrue(isNonEmptySameMentions(validMentions, validMentions));
    assert.isFalse(isNonEmptySameMentions(validMentions, obfuscatedMentions));
    content = validMentions.map((m) => {
      return `+[${m.nickname}](${m.obfuscatedId})`;
    }).join('\\n## blahnshouen');
  });

  it('should unObfuscate mention ids', () => {
    const mentions = unObfuscateIdAnReturnValidMentions(obfuscatedMentions);
    for (const m of mentions) {
      assert.isDefined(m.id);
      assert.notEqual(m.id, INVALID_NUMERIC_ID);
    }
    assert.strictEqual(mentions.length, validMentions.length);
  });

  it('should filter invalid mentions', () => {
    const oldLength = obfuscatedMentions.length;
    obfuscatedMentions[0].obfuscatedId = 'saoteua';
    const mentions = unObfuscateIdAnReturnValidMentions(obfuscatedMentions);
    assert.strictEqual(mentions.length, oldLength - 1);
  });

  it('should get all mentions', () => {
    const textContent = new TextContentModel();
    textContent.content = content;
    const mentions = textContent.extractMentionsFromContent();
    assert.isAtLeast(mentions.length, 1);
    assert.strictEqual(mentions.length, validMentions.length);
    assert.isTrue(isNonEmptySameMentions(validMentions, mentions));
  });

  it('should correct wrong nicknames', () => {
    const clonedMentions = JSON.parse(JSON.stringify(validMentions));
    assert.isAtLeast(clonedMentions.length, 1);
    const idNicknameMap: any = {};
    for (let i = 0; i < clonedMentions.length; ++i) {
      let c = clonedMentions[i];
      let v = validMentions[i];
      c.nickname = `nick${i}`;
      assert.notEqual(c.nickname, v.nickname);
      assert.strictEqual(c.id, v.id);
      assert.strictEqual(c.obfuscatedId, v.obfuscatedId);
      idNicknameMap[c.obfuscatedId] = c.nickname;
    }
    const textContent = new TextContentModel();
    textContent.content = sanitizeContentMentions(content, idNicknameMap);
    const mentions = textContent.extractMentionsFromContent();
    assert.strictEqual(mentions.length, clonedMentions.length);

    for (let m of mentions) {
      assert.isOk(validMentions.find((e) => {
        return e.nickname !== m.nickname && e.id === m.id && e.obfuscatedId === m.obfuscatedId;
      }));
    }
  });

  const makeMentionableUsers = function(mentions: Mentions) {
    const mentionableUsers: MentionableUsers = [];
    for (const m of mentions) {
      (mentionableUsers as any).push({
        id: m.id,
        nickname: m.nickname
      });
    }
    return mentionableUsers;
  };

  it('should not remove allowed mentions', () => {
    const textContent = new TextContentModel();
    textContent.content = content;
    let mentions = textContent.__sanitizeContentMentions(validMentions, makeMentionableUsers(validMentions));
    assert.isTrue(isNonEmptySameMentions(mentions, validMentions));
    assert.isTrue(isNonEmptySameMentions(validMentions, textContent.extractMentionsFromContent()));
  });

  it('should remove non-allowed mentions', () => {
    const allowedMentions = validMentions.slice(0, validMentions.length - 1);
    assert.strictEqual(allowedMentions.length, validMentions.length - 1);
    assert.isAtLeast(allowedMentions.length, 1);

    const textContent = new TextContentModel();
    textContent.content = content;
    let mentions = textContent.__sanitizeContentMentions(validMentions, makeMentionableUsers(allowedMentions));
    assert.isTrue(isNonEmptySameMentions(mentions, allowedMentions));

    assert.isTrue(isNonEmptySameMentions(allowedMentions, textContent.extractMentionsFromContent()));
  });
});
