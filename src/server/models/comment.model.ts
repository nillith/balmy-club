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
  INVALID_NUMERIC_ID,
  obfuscatorFuns
} from "../service/obfuscator.service";
import {PostObserver} from "./post.model";
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
    const _this = this;
    let mentions = _this.extractMentionsFromContent();
    if (!_.isEmpty(mentions)) {
      mentions = await _this.sanitizeContentMentions(mentions);
    }
    const mentionIds = JSON.stringify(mentions.map((m) => m.id));
    const raw: RawComment = {
      authorId: _this[$authorId],
      postId: _this[$postId],
      content: _this.content,
      createdAt: _this.createdAt,
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

export interface CommentAuthorPost {
  commentAuthorId: number;
  postId: number;
}

const GET_AUTHOR_ID_AND_POST_ID_IF_ACCESSIBLE_SQL = 'SELECT authorId AS commentAuthorId, postId FROM Comments WHERE id = :commentId AND authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :observerId) AND authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :observerId)';

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
  DELETE_IF_IS_AUTHOR = 'UPDATE Comments SET deletedAt = :timestamp WHERE id = :commentId AND authorId = :authorId'
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

  static async getCommentsForPost(params: PostObserver, driver: DatabaseDriver = db): Promise<CommentRecord[]> {
    const [rows] = await driver.query(GET_COMMENTS_BY_POST_ID_SQL, params);
    return _.map(rows, (row) => {
      return fromDatabaseRow(row, CommentRecord);
    });
  }


  static async getAuthorIdPostIdIfAccessible(params: CommentObserver, driver: DatabaseDriver = db): Promise<CommentAuthorPost> {
    assertValidCommentViewer(params);
    const [rows] = await driver.query(GET_AUTHOR_ID_AND_POST_ID_IF_ACCESSIBLE_SQL, params);
    if (rows && rows[0] && rows[0]) {
      return rows[0];
    } else {
      return {
        commentAuthorId: INVALID_NUMERIC_ID,
        postId: INVALID_NUMERIC_ID
      };
    }
  }

  static async isAccessible(params: CommentObserver, driver: DatabaseDriver = db): Promise<boolean> {
    const {commentAuthorId} = await this.getAuthorIdPostIdIfAccessible(params, driver);
    return INVALID_NUMERIC_ID !== commentAuthorId;
  }

  static async deleteByAuthor(params: CommentAuthor, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidCommentOwner(params);
    const replacements = Object.create(params);
    replacements.timestamp = utcTimestamp();
    const [rows] = await driver.query(SQLs.DELETE_IF_IS_AUTHOR as string, replacements) as any;
    return rows.affectedRows === 1;
  }
}
