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

interface GetUserPostsParams {
  userId: number;
  timestamp: number;
  offset: number;
  viewerId: number;
}

const assertIsValidGetUserPostsParams = devOnly(function(params: any) {
  console.log(isNumericId(params.userId), `invalid userId ${params.userId}`);
  console.log(isNumericId(params.viewerId), `invalid viewerId ${params.viewerId}`);
  console.log(isValidTimestamp(params.timestamp), `invalid timestamp ${params.timestamp}`);
  console.log(Number.isSafeInteger(params.offset) && params.offset >= 0, `invalid offset ${params.offset}`);
});

const GET_USER_POSTS_SQL = `SELECT Posts.id, authorId, reShareFromPostId, content, visibility, plusCount, reShareCount, createdAt FROM Posts LEFT JOIN PostCircle ON (Posts.id = PostCircle.postId) WHERE Posts.authorId = :userId AND Posts.createdAt < :timestamp AND (visibility = ${PostVisibilities.Public} OR (visibility = ${PostVisibilities.Private} AND PostCircle.circleId IN (SELECT circleId FROM CircleUser WHERE circleId IN (SELECT id FROM Circles WHERE ownerId = :userId) AND userId = :viewerId))) ORDER BY createdAt DESC LIMIT :offset, ${POSTS_GROUP_SIZE}`;

export class PostModel extends TextContentModel {
  static readonly [$obfuscator] = postObfuscator;
  static readonly [$outboundFields] = makeFieldMaps([
    $id,
    $authorId,
    $reShareFromPostId,
    'content', 'visibility', 'plusCount', 'reShareCount', 'createdAt', 'comments'
  ]);

  static unObfuscateFrom(obj: any): PostModel | undefined {
    throw Error('Not implemented');
  }


  static async getUserPosts(params: GetUserPostsParams, driver: DatabaseDriver = db) {
    assertIsValidGetUserPostsParams(params);
    const [rows] = await driver.query(GET_USER_POSTS_SQL, params);
    return _.map(rows, (row) => {
      return makeInstance(row, PostModel);
    });
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
