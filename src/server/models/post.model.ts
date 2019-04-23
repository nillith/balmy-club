import {isValidTimestamp, utcTimestamp} from "../../shared/utils";
import {
  $id,
  $outboundCloneFields,
  $reShareFromPostId,
  $visibleCircleIds,
  INVALID_NUMERIC_ID,
  obfuscatorFuns,
  POST_OBFUSCATE_MAPS,
} from "../service/obfuscator.service";
import {isValidPostVisibility, PostVisibilities} from "../../shared/interf";
import {devOnly, isNumericId} from "../utils/index";
import {DatabaseDriver, fromDatabaseRow, insertReturnId, Observer} from "./model-base";
import db from "../persistence/index";
import {POSTS_GROUP_SIZE} from "../../shared/constants";
import _ from 'lodash';
import {
  assertValidRawTextContent,
  RawTextContent,
  TextContentBuilder,
  TextContentOutboundCloneFields,
  TextContentRecord
} from "./text-content.model";
import {CommentRecord} from "./comment.model";
import {UserRecord} from "./user.model";


export class PostRecord extends TextContentRecord {
  static readonly [$outboundCloneFields] = TextContentOutboundCloneFields.concat([
    'visibility', 'reShareCount', 'comments'
  ]);
  [$reShareFromPostId]?: number;
  visibility: PostVisibilities;
  comments?: CommentRecord[];

  constructor(id: number, authorId: number, content: string, createdAt: number, visibility: PostVisibilities) {
    super(id, authorId, content, createdAt);
    this.visibility = visibility;
  }
}

const {
  unObfuscateCloneFrom, obfuscateCloneTo, hideCloneFrom
} = obfuscatorFuns(POST_OBFUSCATE_MAPS);

PostRecord.prototype.obfuscateCloneTo = obfuscateCloneTo;
PostRecord.prototype.unObfuscateCloneFrom = unObfuscateCloneFrom;
PostRecord.prototype.hideCloneFrom = hideCloneFrom;


export interface PublishPostData {
  reShareFromPostId?: number;
  visibility: PostVisibilities;
  content: string;
  visibleCircleIds?: number[];
}

export class PostBuilder extends TextContentBuilder implements RawPost {
  reShareFromPostId?: number;
  visibleCircleIds?: number[];
  visibility: PostVisibilities;


  constructor(author: UserRecord, data: PublishPostData, timestamp: number) {
    super(author[$id], data.content, timestamp);
    if (data.reShareFromPostId) {
      this[$reShareFromPostId] = data.reShareFromPostId;
    }

    if (data.visibleCircleIds) {
      this[$visibleCircleIds] = data.visibleCircleIds;
    }
    this.visibility = data.visibility;
  }
}

export interface RawPost extends RawTextContent {
  reShareFromPostIdL?: number;
  visibility: PostVisibilities;
}

const assertValidRawModel = devOnly(function(data: any) {
  assertValidRawTextContent(data);
  console.assert(!data.reShareFromPostId || isNumericId(data.reShareFromPostId), `invalid reShareFromPostId: ${data.reShareFromPostId}`);
  console.assert(isValidPostVisibility(data.visibility), `invalid visibility: ${data.visibility}`);
});

const enum SQLs {
  INSERT = 'INSERT INTO Posts (authorId, reShareFromPostId, content, createdAt, visibility, mentionIds) VALUES(:authorId, :reShareFromPostId, :content, :createdAt, :visibility, :mentionIds)'
}

interface TimelineParams extends Observer {
  timestamp: number;
  offset: number;
  observerId: number;
}

interface UserTimelineParams extends TimelineParams {
  userId: number;
}

const isValidStreamOffset = function(offset: any) {
  return Number.isSafeInteger(offset) && offset >= 0 && ((offset % POSTS_GROUP_SIZE) === 0)
};

const assertValidTimelineParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.observerId), `invalid observerId ${params.observerId}`);
  console.assert(isValidTimestamp(params.timestamp), `invalid timestamp ${params.timestamp}`);
  console.assert(isValidStreamOffset(params.offset), `invalid offset ${params.offset}`);
});

const assertIsValidUserTimelineParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.userId), `invalid userId ${params.userId}`);
  assertValidTimelineParams(params);
});

export interface PostObserver {
  postId: number;
  observerId: number;
}

const assertValidPostViewer = devOnly(function(params: any) {
  console.assert(isNumericId(params.postId), `invalid postId ${params.postId}`);
  console.assert(isNumericId(params.observerId), `invalid observerId ${params.observerId}`);
});

interface TimelineSqlCreateOptions {
  withUser?: boolean;
  withPrivatePost?: boolean;
  singleUser?: boolean;
  circledOnly?: boolean;
}

const POST_PUBLIC_SQL_COLUMNS = [
  'Posts.id',
  'Posts.authorId',
  'Posts.reShareFromPostId',
  'Posts.content',
  'Posts.visibility',
  'Posts.plusCount',
  'Posts.reShareCount',
  'Posts.createdAt',
  'PostPlusOnes.id IS NOT NULL AS plusedByMe',
];

const POST_PUBLIC_SQL_COLUMNS_WITH_USER = POST_PUBLIC_SQL_COLUMNS.concat(['Users.nickname AS authorNickname', 'Users.avatarUrl AS authorAvatarUrl']);

const processVisibilityOption = function(options: TimelineSqlCreateOptions, ands: string[], leftJoins: string[]) {
  const visibilityOr = [
    'Posts.authorId = :observerId'
  ];

  const visibilitySubAnd = [
    'Posts.authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :observerId)',
    'Posts.authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :observerId)',
  ];


  const visibilitySubAndSubOr = [
    `visibility = ${PostVisibilities.Public}`
  ];

  if (options.withPrivatePost) {
    leftJoins.push('PostCircle ON (Posts.id = PostCircle.postId)');
    visibilitySubAndSubOr.push(`(visibility = ${PostVisibilities.Private} AND PostCircle.circleId IN (SELECT circleId FROM CircleUser WHERE userId = :observerId))`);
  }

  visibilitySubAnd.push(`(${visibilitySubAndSubOr.join(' OR ')})`);
  visibilityOr.push(`(${visibilitySubAnd.join(' AND ')})`);

  ands.push(`(${visibilityOr.join(' OR ')})`);
};


const createTimelineSql = function(options: TimelineSqlCreateOptions) {
  let cols = POST_PUBLIC_SQL_COLUMNS;

  const leftJoins = [
    'Posts',
    '(SELECT * FROM PostPlusOnes WHERE userId = :observerId) PostPlusOnes ON (PostPlusOnes.postId = Posts.id)'
  ];
  if (options.withUser) {
    leftJoins.push('Users ON (Posts.authorId = Users.id)');
    cols = POST_PUBLIC_SQL_COLUMNS_WITH_USER;
  }


  const ands = [
    'Posts.deletedAt IS NULL',
    'Posts.createdAt < :timestamp',
  ];

  if (options.singleUser) {
    ands.push('Posts.authorId = :userId');
  } else if (options.circledOnly) {
    ands.push('(Posts.authorId = :observerId OR Posts.authorId IN (SELECT userId FROM CircleUser WHERE circleId IN (SELECT id FROM Circles WHERE ownerId = :observerId)))');
  }
  processVisibilityOption(options, ands, leftJoins);
  return `SELECT ${cols.join(', ')} FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} ORDER BY Posts.createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;
};

const GET_POST_BY_ID_SQL = (function() {
  const leftJoins = ['Posts',
    '(SELECT * FROM PostPlusOnes WHERE userId = :observerId) PostPlusOnes ON (PostPlusOnes.postId = Posts.id)',
    'Users ON (Posts.authorId = Users.id)'];
  const ands = ['Posts.id = :postId', 'Posts.deletedAt IS NULL'];
  processVisibilityOption({
    withPrivatePost: true,
  }, ands, leftJoins);
  return `SELECT ${POST_PUBLIC_SQL_COLUMNS_WITH_USER.join(', ')} FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} LIMIT 1`;
})();

const GET_AUTHOR_ID_IF_ACCESSIBLE_SQL = (function() {
  const leftJoins = ['Posts'];
  const ands = ['Posts.id = :postId', 'Posts.deletedAt IS NULL'];
  processVisibilityOption({
    withPrivatePost: true,
  }, ands, leftJoins);
  return `SELECT Posts.authorId FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} LIMIT 1`;
})();

const IS_POST_AUTHOR_SQL = 'SELECT id FROM Posts WHERE id = :postId AND authorId = :observerId';

const POST_OTHER_COMMENTER_IDS_SQL = 'SELECT id FROM Comments WHERE postId = :postId AND authorId != :observerId AND authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :observerId) AND authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :observerId)';

const PUBLIC_TIMELINE_POSTS_SQL = createTimelineSql({
  withUser: true,
});


const USER_TIMELINE_POSTS_SQL = createTimelineSql({
  singleUser: true,
  withPrivatePost: true,
});

const HOME_STREAM_POSTS_SQL = createTimelineSql({
  withUser: true,
  withPrivatePost: true,
  circledOnly: true,
});

export interface PostAuthor {
  postId: number;
  authorId: number;
}

const assertValidPostAuthor = devOnly(function(params: any) {
  console.assert(isNumericId(params.postId), `invalid postId ${params.commentId}`);
  console.assert(isNumericId(params.authorId), `invalid authorId ${params.authorId}`);
});

const DELETE_IF_IS_AUTHOR = 'UPDATE Posts SET deletedAt = :timestamp WHERE id = :postId AND authorId = :authorId';

export class PostModel {

  private static async getPostsBySQL(sql: string, params: any, driver: DatabaseDriver = db): Promise<PostRecord[]> {
    const [rows] = await driver.query(sql, params);
    return _.map(rows, (row) => {
      return fromDatabaseRow(row, PostRecord);
    });
  }

  static async getPostById(params: PostObserver, driver: DatabaseDriver = db) {
    const [rows] = await driver.query(GET_POST_BY_ID_SQL, params);
    if (rows && rows[0]) {
      return fromDatabaseRow(rows[0], PostRecord);
    }
  }

  static async getUserTimelinePosts(params: UserTimelineParams, driver: DatabaseDriver = db): Promise<PostRecord[]> {
    assertIsValidUserTimelineParams(params);
    return this.getPostsBySQL(USER_TIMELINE_POSTS_SQL, params, driver);
  }

  static async getPublicTimelinePosts(params: TimelineParams, driver: DatabaseDriver = db): Promise<PostRecord[]> {
    assertValidTimelineParams(params);
    return this.getPostsBySQL(PUBLIC_TIMELINE_POSTS_SQL, params, driver);
  }

  static async getHomeTimelinePosts(params: TimelineParams, driver: DatabaseDriver = db): Promise<PostRecord[]> {
    assertValidTimelineParams(params);
    return this.getPostsBySQL(HOME_STREAM_POSTS_SQL, params, driver);
  }

  static async getAuthorIdIfAccessible(params: PostObserver, driver: DatabaseDriver = db): Promise<number> {
    assertValidPostViewer(params);
    const [rows] = await driver.query(GET_AUTHOR_ID_IF_ACCESSIBLE_SQL, params);
    if (rows && rows[0] && rows[0].authorId) {
      return rows[0].authorId;
    } else {
      return INVALID_NUMERIC_ID;
    }
  }

  static async isAccessible(params: PostObserver, driver: DatabaseDriver = db): Promise<boolean> {
    return INVALID_NUMERIC_ID !== await this.getAuthorIdIfAccessible(params, driver);
  }

  static async isAuthor(params: PostObserver, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidPostViewer(params);
    const [rows] = await driver.query(IS_POST_AUTHOR_SQL, params);
    return !_.isEmpty(rows);
  }

  static async getAuthorId(postId: number, driver: DatabaseDriver = db): Promise<number> {
    const [rows] = await driver.query('SELECT authorId FROM Posts WHERE id = :postId', {
      postId
    });
    if (rows && rows[0]) {
      return rows[0].authorId;
    }
    return INVALID_NUMERIC_ID;
  }

  static async getOtherCommenterIds(params: PostObserver, driver: DatabaseDriver = db): Promise<number[]> {
    assertValidPostViewer(params);
    const [rows] = await driver.query(POST_OTHER_COMMENTER_IDS_SQL, params);
    return _.map(rows as any[], row => row.id);
  }


  static async deleteByAuthor(params: PostAuthor, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidPostAuthor(params);
    const replacements = Object.create(params);
    replacements.timestamp = utcTimestamp();
    const [rows] = await driver.query(DELETE_IF_IS_AUTHOR, replacements) as any;
    return rows.affectedRows === 1;
  }

  static async insert(raw: RawPost, drive: DatabaseDriver = db): Promise<number> {
    assertValidRawModel(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }
}
