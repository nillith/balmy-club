import {devOnly, isNumericId} from "../utils/index";
import {DatabaseDriver, fromDatabaseRow, insertReturnId,} from "./model-base";
import db from "../persistence/index";
import _ from 'lodash';
import {
  assertValidRawTextContent,
  Mentions,
  TextContentBuilder,
  TextContentOutboundCloneFields,
  TextContentRecord
} from "./text-content.model";
import {
  $authorId,
  $outboundCloneFields,
  $postId,
  COMMENT_OBFUSCATE_MAPS,
  obfuscatorFuns
} from "../service/obfuscator.service";
import {PostViewer} from "./post.model";
import {utcTimestamp} from "../../shared/utils";


export interface PublishCommentData {
  postId: number;
  content: string;
}

export class CommentBuilder extends TextContentBuilder {
  [$postId]: number;

  constructor(authorId: number, postId: number, content: string, createdAt: number) {
    super(authorId, content, createdAt);
    this[$postId] = postId;
  }

  async build(): Promise<[Mentions, RawComment]> {
    const self = this;
    let mentions = self.extractMentionsFromContent();
    if (!_.isEmpty(mentions)) {
      mentions = await self.sanitizeContentMentions(mentions);
    }
    const mentionIds = JSON.stringify(mentions.map((m) => m.id));
    const raw: RawComment = {
      authorId: self[$authorId],
      postId: self[$postId],
      content: self.content,
      createdAt: self.createdAt,
      mentionIds
    };
    return [mentions, raw];
  }
}

export class CommentRecord extends TextContentRecord {
  static readonly [$outboundCloneFields] = TextContentOutboundCloneFields.concat([]);
  [$postId]: number;

  constructor(id: number, authorId: number, postId: number, content: string, createdAt: number) {
    super(id, authorId, content, createdAt);
    this[$postId] = postId;
  }
}

const {
  unObfuscateCloneFrom, obfuscateCloneTo, hideCloneFrom
} = obfuscatorFuns(COMMENT_OBFUSCATE_MAPS);

CommentRecord.prototype.obfuscateCloneTo = obfuscateCloneTo;
CommentRecord.prototype.unObfuscateCloneFrom = unObfuscateCloneFrom;
CommentRecord.prototype.hideCloneFrom = hideCloneFrom;

export interface RawComment {
  authorId: number;
  postId: number;
  content: string;
  createdAt: number;
  mentionIds: string;
}


const assertValidRawComment = devOnly(function(data: any) {
  console.assert(isNumericId(data.postId), `invalid postId: ${data.postId}`);
  assertValidRawTextContent(data);
});


const GET_COMMENTS_BY_POST_ID_SQL = 'SELECT Comments.id, postId, authorId, content, createdAt, updatedAt, Users.nickname AS authorNickname, Users.avatarUrl AS authorAvatarUrl, CommentPlusOnes.id IS NOT NULL AS plusedByMe FROM (SELECT * FROM Comments WHERE deletedAt IS NULL) Comments LEFT JOIN (SELECT * FROM CommentPlusOnes WHERE userId = :observerId) CommentPlusOnes ON (Comments.id = CommentPlusOnes.commentId) LEFT JOIN Users ON (Comments.authorId = Users.id) WHERE postId = :postId AND (Comments.authorId = :observerId OR (Comments.authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :observerId) AND Comments.authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :observerId)))';

const IS_COMMENT_ACCESSIBLE_SQL = 'SELECT id FROM Comments WHERE id = :commentId AND authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :observerId) AND authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :observerId)';

export interface CommentObserver {
  commentId: number;
  observerId: number;
}

const assertValidCommentViewer = devOnly(function(params: any) {
  console.assert(isNumericId(params.commentId), `invalid commentId ${params.commentId}`);
  console.assert(isNumericId(params.observerId), `invalid observerId ${params.observerId}`);
});

const enum SQLs {
  INSERT = 'INSERT INTO Comments (postId, authorId, content, createdAt, mentionIds) VALUES(:postId, :authorId, :content, :createdAt, :mentionIds)',
  DELETE = 'UPDATE Comments SET deletedAt = :timestamp WHERE id = :commentId AND authorId = :authorId'
}

export interface CommentAuthor {
  commentId: number;
  authorId: number;
}

const assertValidCommentOwner = devOnly(function(params: any) {
  console.assert(isNumericId(params.commentId), `invalid commentId ${params.commentId}`);
  console.assert(isNumericId(params.authorId), `invalid authorId ${params.authorId}`);
});

export class CommentModel {
  static async insert(raw: RawComment, drive: DatabaseDriver = db): Promise<number> {
    assertValidRawComment(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }

  static async getCommentsForPost(params: PostViewer, driver: DatabaseDriver = db): Promise<CommentRecord[]> {
    const [rows] = await driver.query(GET_COMMENTS_BY_POST_ID_SQL, params);
    return _.map(rows, (row) => {
      return fromDatabaseRow(row, CommentRecord);
    });
  }

  static async isAccessible(params: CommentObserver, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidCommentViewer(params);
    const [rows] = await driver.query(IS_COMMENT_ACCESSIBLE_SQL, params);
    return !!rows && !!rows[0] && !!rows[0].id;
  }

  static async deleteCommentById(params: CommentAuthor, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidCommentOwner(params);
    const replacements = Object.create(params);
    replacements.timestamp = utcTimestamp();
    const [rows] = await driver.query(SQLs.DELETE as string, replacements) as any;
    return rows.affectedRows === 1;
  }
}
