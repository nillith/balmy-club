import {isValidPostContent, isValidTimestamp, makeInstance} from "../../shared/utils";
import {
  $authorId,
  $id,
  $obfuscator,
  $outboundFields,
  $postId,
  COMMENT_OBFUSCATE_MAPS,
  obfuscatorFuns,
  postObfuscator,
} from "../service/obfuscator.service";
import {devOnly, isNumericId} from "../utils/index";
import {TextContentModel} from "./text-content.model";
import {DatabaseDriver, makeFieldMaps} from "./model-base";
import db from "../persistence/index";
import _ from 'lodash';
import {PostViewer} from "./post.model";

const assertValidNewModel = devOnly(function(model: CommentModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isNumericId(model.authorId), `invalid authorId: ${model.authorId}`);
  console.assert(isNumericId(model.postId), `invalid postId: ${model.postId}`);
  console.assert(isValidPostContent(model.content), `invalid content`);
  console.assert(isValidTimestamp(model.createdAt), `invalid timestamp ${model.createdAt}`);
});

const INSERT_SQL = 'INSERT INTO Comments (id, postId, authorId, content, createdAt, updatedAt, mentionIds) VALUES(:id, :postId, :authorId, :content, :createdAt, :updatedAt, :mentionIds)';

const GET_COMMENTS_BY_POST_ID_SQL = 'SELECT Comments.id, postId, authorId, content, createdAt, updatedAt, Users.nickname AS authorNickname, Users.avatarUrl AS authorAvatarUrl FROM Comments LEFT JOIN Users ON (Comments.authorId = Users.id) WHERE postId = :postId AND (Comments.authorId = :viewerId OR (Comments.authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :viewerId) AND Comments.authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :viewerId)))';

const IS_COMMENT_ACCESSIBLE_SQL = 'SELECT id FROM Comments WHERE id = :commentId AND authorId NOT IN (SELECT blockerId FROM UserBlockUser WHERE blockeeId = :viewerId) AND Posts.authorId NOT IN (SELECT blockeeId FROM UserBlockUser WHERE blockerId = :viewerId)';

export interface CommentViewer {
  commentId: number;
  viewerId: number;
}

const assertValidCommentViewer = devOnly(function(params: any) {
  console.assert(isNumericId(params.commentId), `invalid commentId ${params.postId}`);
  console.assert(isNumericId(params.viewerId), `invalid viewerId ${params.viewerId}`);
});


export class CommentModel extends TextContentModel {
  static readonly [$obfuscator] = postObfuscator;
  static readonly [$outboundFields] = makeFieldMaps([
    $id,
    $authorId,
    'content', 'plusCount', 'createdAt', 'authorNickname', 'authorAvatarUrl'
  ]);

  static unObfuscateFrom(obj: any): CommentModel | undefined {
    throw Error('Not implemented');
  }

  postId?: number | string;
  [$postId]?: string;


  async insertIntoDatabase(driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidNewModel(self);

    let replacements: any = Object.create(self);
    replacements.mentionIds = JSON.stringify(self.mentionIds || []);
    await self.insertIntoDatabaseAndRetrieveId(driver, INSERT_SQL, replacements);
  }

  static async getCommentsByPostId(params: PostViewer, driver: DatabaseDriver = db): Promise<CommentModel[]> {
    const [rows] = await driver.query(GET_COMMENTS_BY_POST_ID_SQL, params);
    return _.map(rows, (row) => {
      return makeInstance(row, CommentModel);
    });
  }

  static async isAccessible(params: CommentViewer, driver: DatabaseDriver = db): Promise<boolean> {
    assertValidCommentViewer(params);
    const [rows] = await driver.query(IS_COMMENT_ACCESSIBLE_SQL, params);
    return !!rows && !!rows[0] && !!rows[0].id;
  }
}


({
  unObfuscateFrom: CommentModel.unObfuscateFrom,
  obfuscate: CommentModel.prototype.obfuscate
} = obfuscatorFuns(COMMENT_OBFUSCATE_MAPS, CommentModel));
