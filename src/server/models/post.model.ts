import {isValidPostContent, isValidTimestamp, makeInstance} from "../../shared/utils";
import {
  $authorId,
  $id,
  $obfuscator,
  $outboundFields,
  $reShareFromPostId,
  $visibleCircleIds,
  obfuscatorFuns,
  POST_OBFUSCATE_MAPS,
  postObfuscator,
} from "../service/obfuscator.service";
import {isValidPostVisibility, PostVisibilities} from "../../shared/interf";
import {devOnly, isNumericId} from "../utils/index";
import {TextContentModel} from "./text-content.model";
import {DatabaseDriver, makeFieldMaps} from "./model-base";
import db from "../persistence/index";
import {POSTS_GROUP_SIZE} from "../../shared/constants";
import _ from 'lodash';
import {CommentModel} from "./comment.model";

const assertValidNewModel = devOnly(function(model: PostModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isNumericId(model.authorId), `invalid authorId: ${model.authorId}`);
  console.assert(!model.reShareFromPostId || isNumericId(model.reShareFromPostId), `invalid reShareFromPostId: ${model.reShareFromPostId}`);
  console.assert(isValidPostVisibility(model.visibility), `invalid visibility: ${model.visibility}`);
  console.assert(isValidPostContent(model.content), `invalid content`);
  console.assert(isValidTimestamp(model.createdAt), `invalid timestamp ${model.createdAt}`);
});

const INSERT_SQL = `INSERT INTO Posts (authorId, reShareFromPostId, content, createdAt, visibility, mentionIds) VALUES(:authorId, :reShareFromPostId, :content, :createdAt, :visibility, :mentionIds)`;

interface TimelineParams {
  timestamp: number;
  offset: number;
  viewerId: number;
}

interface UserTimelineParams extends TimelineParams {
  userId: number;

}

const isValidStreamOffset = function(offset: any) {
  return Number.isSafeInteger(offset) && offset >= 0 && ((offset % POSTS_GROUP_SIZE) === 0)
};

const assertValidTimelineParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.viewerId), `invalid viewerId ${params.viewerId}`);
  console.assert(isValidTimestamp(params.timestamp), `invalid timestamp ${params.timestamp}`);
  console.assert(isValidStreamOffset(params.offset), `invalid offset ${params.offset}`);
});

const assertIsValidUserTimelineParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.userId), `invalid userId ${params.userId}`);
  assertValidTimelineParams(params);
});


interface TimelineSqlCreateOptions {
  withUser?: boolean;
  withPrivatePost?: boolean;
  singleUser?: boolean;
}

const createTimelineSql = (function() {

  const POST_PUBLIC_SQL_COLUMNS = [
    'Posts.id',
    'Posts.authorId',
    'Posts.reShareFromPostId',
    'Posts.content',
    'Posts.visibility',
    'Posts.plusCount',
    'Posts.reShareCount',
    'Posts.createdAt'
  ];

  const POST_PUBLIC_SQL_COLUMNS_WITH_USER = POST_PUBLIC_SQL_COLUMNS.concat(['Users.nickname AS authorNickname', 'Users.avatarUrl AS authorAvatarUrl']);


  return function(options: TimelineSqlCreateOptions) {
    let cols = POST_PUBLIC_SQL_COLUMNS;

    const froms = ['Posts'];
    if (options.withUser) {
      froms.push('Users ON (Posts.authorId = Users.id)');
      cols = POST_PUBLIC_SQL_COLUMNS_WITH_USER;
    }


    const ands = [
      'Posts.createdAt < :timestamp',
    ];

    if (options.singleUser) {
      ands.push('Posts.authorId = :userId');
    }

    const visibilityOr = [
      'Posts.authorId = :viewerId'
    ];

    const visibilitySubAnd = [
      'Posts.authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :viewerId)',
      'Posts.authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :viewerId)',
    ];


    const visibilitySubAndSubOr = [
      `visibility = ${PostVisibilities.Public}`
    ];

    if (options.withPrivatePost) {
      froms.push('PostCircle ON (Posts.id = PostCircle.postId)');
      visibilitySubAndSubOr.push(`(visibility = ${PostVisibilities.Private} AND PostCircle.circleId IN (SELECT circleId FROM CircleUser WHERE userId = :viewerId))`);
    }

    visibilitySubAnd.push(`(${visibilitySubAndSubOr.join(' OR ')})`);
    visibilityOr.push(`(${visibilitySubAnd.join(' AND ')})`);

    ands.push(`(${visibilityOr.join(' OR ')})`);

    return `SELECT ${cols.join(', ')} FROM ${froms.join(' LEFT JOIN ')} WHERE ${ands.join(' AND ')} ORDER BY Posts.createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;
  };
})();


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

export class PostModel extends TextContentModel {
  static readonly [$obfuscator] = postObfuscator;
  static readonly [$outboundFields] = makeFieldMaps([
    $id,
    $authorId,
    $reShareFromPostId,
    'content', 'visibility', 'plusCount', 'reShareCount', 'createdAt', 'comments', 'authorNickname', 'authorAvatarUrl'
  ]);

  static unObfuscateFrom(obj: any): PostModel | undefined {
    throw Error('Not implemented');
  }

  private static async getPostsBySQL(sql: string, params: any, driver: DatabaseDriver = db) {
    const [rows] = await driver.query(sql, params);
    return _.map(rows, (row) => {
      return makeInstance(row, PostModel);
    });
  }


  static async getUserTimelinePosts(params: UserTimelineParams, driver: DatabaseDriver = db) {
    assertIsValidUserTimelineParams(params);
    return this.getPostsBySQL(USER_TIMELINE_POSTS_SQL, params, driver);
  }

  static async getPublicTimelinePosts(params: TimelineParams, driver: DatabaseDriver = db) {
    assertValidTimelineParams(params);
    return this.getPostsBySQL(PUBLIC_TIMELINE_POSTS_SQL, params, driver);
  }

  static async getHomeTimelinePosts(params: TimelineParams, driver: DatabaseDriver = db) {
    assertValidTimelineParams(params);
    return this.getPostsBySQL(HOME_STREAM_POSTS_SQL, params, driver);
  }


  reShareFromPostId?: number | string;
  [$reShareFromPostId]?: string;
  visibility?: PostVisibilities;
  [$authorId]?: string;
  [$visibleCircleIds]?: string[];
  visibleCircleIds?: (number[]) | (string[]);
  reShareCount?: number;
  comments?: CommentModel[];

  async insertIntoDatabase(driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidNewModel(self);

    let replacements: any = Object.create(self);
    replacements.mentionIds = JSON.stringify(self.mentionIds || []);
    await self.insertIntoDatabaseAndRetrieveId(driver, INSERT_SQL, replacements);
  }

}


({
  unObfuscateFrom: PostModel.unObfuscateFrom,
  obfuscate: PostModel.prototype.obfuscate
} = obfuscatorFuns(POST_OBFUSCATE_MAPS, PostModel));
