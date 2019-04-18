import {isValidTimestamp, makeInstance} from "../../shared/utils";
import {
  $authorId,
  $id,
  $outboundCloneFields,
  $reShareFromPostId,
  $visibleCircleIds,
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
  Mentions,
  RawTextContent,
  TextContentBuilder, TextContentOutboundCloneFields,
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

export class PostBuilder extends TextContentBuilder {
  [$reShareFromPostId]?: number;
  [$visibleCircleIds]?: number[];
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

  async build(): Promise<[Mentions, RawPost]> {
    const self = this;
    let mentions = self.extractMentionsFromContent();
    if (!_.isEmpty(mentions)) {
      mentions = await self.sanitizeContentMentions(mentions);
    }
    const mentionIds = JSON.stringify(mentions.map((m) => m.id));
    const raw: RawPost = {
      authorId: self[$authorId],
      content: self.content,
      createdAt: self.createdAt,
      mentionIds,
      reShareFromPostId: self[$reShareFromPostId] || null,
      visibility: self.visibility,
    };
    return [mentions, raw];
  }
}

export interface RawPost extends RawTextContent {
  reShareFromPostId: number | null;
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

export interface PostViewer {
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
    'Posts.createdAt < :timestamp',
  ];

  if (options.singleUser) {
    ands.push('Posts.authorId = :userId');
  }
  processVisibilityOption(options, ands, leftJoins);
  return `SELECT ${cols.join(', ')} FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} ORDER BY Posts.createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;
};

const GET_POST_BY_ID_SQL = (function() {
  const leftJoins = ['Posts LEFT JOIN Users ON (Posts.authorId = Users.id)'];
  const ands = ['Posts.id = :postId'];
  processVisibilityOption({
    withPrivatePost: true,
  }, ands, leftJoins);
  return `SELECT ${POST_PUBLIC_SQL_COLUMNS_WITH_USER.join(', ')} FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} LIMIT 1`;
})();

const IS_POST_ACCESSIBLE_SQL = (function() {
  const leftJoins = ['Posts'];
  const ands = ['Posts.id = :postId'];
  processVisibilityOption({
    withPrivatePost: true,
  }, ands, leftJoins);
  return `SELECT Posts.id FROM ${leftJoins.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} LIMIT 1`;
})();


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
  withPrivatePost: true
});

export class PostModel {

  private static async getPostsBySQL(sql: string, params: any, driver: DatabaseDriver = db): Promise<PostRecord[]> {
    const [rows] = await driver.query(sql, params);
    return _.map(rows, (row) => {
      // console.log(row);
      return fromDatabaseRow(row, PostRecord);
    });
  }

  static async getPostById(params: PostViewer, driver: DatabaseDriver = db) {
    const [rows] = await driver.query(GET_POST_BY_ID_SQL, params);
    if (rows && rows[0]) {
      return makeInstance(rows[0], PostRecord);
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

  static async isAccessible(params: PostViewer, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidPostViewer(params);
    const [rows] = await driver.query(IS_POST_ACCESSIBLE_SQL, params);
    return !!rows && !!rows[0] && !!rows[0].id;
  }

  static async getOtherCommenterIds(params: PostViewer, driver: DatabaseDriver = db): Promise<number[]> {
    assertValidPostViewer(params);
    const [rows] = await driver.query(POST_OTHER_COMMENTER_IDS_SQL, params);

    return rows as any as number[];
  }

  reShareFromPostId?: number | string;
  [$reShareFromPostId]?: string;
  visibility?: PostVisibilities;
  [$authorId]?: string;
  [$visibleCircleIds]?: string[];
  visibleCircleIds?: (number[]) | (string[]);
  reShareCount?: number;
  comments?: any[];

  static async insert(raw: RawPost, drive: DatabaseDriver = db): Promise<number> {
    assertValidRawModel(raw);
    return insertReturnId(SQLs.INSERT as string, raw, drive);
  }
}
