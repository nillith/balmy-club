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


interface UserStreamParams {
  userId: number;
  timestamp: number;
  offset: number;
  viewerId: number;
}

const isValidStreamOffset = function(offset: any) {
  return Number.isSafeInteger(offset) && offset >= 0 && ((offset % POSTS_GROUP_SIZE) === 0)
};

const assertIsValidUserStreamParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.userId), `invalid userId ${params.userId}`);
  console.assert(isNumericId(params.viewerId), `invalid viewerId ${params.viewerId}`);
  console.assert(isValidTimestamp(params.timestamp), `invalid timestamp ${params.timestamp}`);
  console.assert(isValidStreamOffset(params.offset), `invalid offset ${params.offset}`);
});

interface PublicStreamParams {
  timestamp: number;
  offset: number;
  viewerId: number;
}

const assertValidPublicStreamParams = devOnly(function(params: any) {
  console.assert(isNumericId(params.viewerId), `invalid viewerId ${params.viewerId}`);
  console.assert(isValidTimestamp(params.timestamp), `invalid timestamp ${params.timestamp}`);
  console.assert(isValidStreamOffset(params.offset), `invalid offset ${params.offset}`);
});

const POST_PUBLIC_COLUMNS = [
  'Posts.id',
  'Posts.authorId',
  'Posts.reShareFromPostId',
  'Posts.content',
  'Posts.visibility',
  'Posts.plusCount',
  'Posts.reShareCount',
  'Posts.createdAt'
];


const PUBLIC_STREAM_POSTS_SQL = `SELECT ${POST_PUBLIC_COLUMNS.concat(['Users.nickname AS authorNickname', 'Users.avatarUrl AS authorAvatarUrl']).join(', ')} FROM Posts LEFT JOIN Users ON (Posts.authorId = Users.id) WHERE Users.id NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :viewerId) AND Users.id NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :viewerId) AND Posts.createdAt < :timestamp AND visibility = ${PostVisibilities.Public} ORDER BY Posts.createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;


const USER_STREAM_POSTS_SQL = `SELECT ${POST_PUBLIC_COLUMNS.join(', ')} FROM Posts LEFT JOIN PostCircle ON (Posts.id = PostCircle.postId) WHERE Posts.authorId = :userId AND Posts.createdAt < :timestamp AND (visibility = ${PostVisibilities.Public} OR (visibility = ${PostVisibilities.Private} AND PostCircle.circleId IN (SELECT circleId FROM CircleUser WHERE circleId IN (SELECT id FROM Circles WHERE ownerId = :userId) AND userId = :viewerId))) ORDER BY Posts.createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;

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


  static async getUserStreamPosts(params: UserStreamParams, driver: DatabaseDriver = db) {
    assertIsValidUserStreamParams(params);
    return this.getPostsBySQL(USER_STREAM_POSTS_SQL, params, driver);
  }

  static async getPublicStreamPosts(params: PublicStreamParams, driver: DatabaseDriver = db) {
    assertValidPublicStreamParams(params);
    return this.getPostsBySQL(PUBLIC_STREAM_POSTS_SQL, params, driver);
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
