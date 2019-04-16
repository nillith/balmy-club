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

const assertValidNewModel = devOnly(function(model: CommentModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isNumericId(model.authorId), `invalid authorId: ${model.authorId}`);
  console.assert(isNumericId(model.postId), `invalid postId: ${model.postId}`);
  console.assert(isValidPostContent(model.content), `invalid content`);
  console.assert(isValidTimestamp(model.createdAt), `invalid timestamp ${model.createdAt}`);
});

const INSERT_SQL = 'INSERT INTO Comments (id, postId, authorId, content, createdAt BIGINT, updatedAt, mentionIds) VALUES(:id, :postId, :authorId, :content, :createdAt, :updatedAt, :mentionIds)';

const GET_COMMENTS_BY_POST_ID_SQL = 'SELECT id, postId, authorId, content, createdAt, updatedAt FROM Comments WHERE postId = :postId';

export class CommentModel extends TextContentModel {
  static readonly [$obfuscator] = postObfuscator;
  static readonly [$outboundFields] = makeFieldMaps([
    $id,
    $authorId,
    'content', 'plusCount', 'createdAt'
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

  static async getCommentsByPostId(postId: number, driver: DatabaseDriver = db): Promise<CommentModel[]> {
    const [rows] = await driver.query(GET_COMMENTS_BY_POST_ID_SQL, {
      postId
    });
    return _.map(rows, (row) => {
      return makeInstance(row, CommentModel);
    });
  }
}


({
  unObfuscateFrom: CommentModel.unObfuscateFrom,
  obfuscate: CommentModel.prototype.obfuscate
} = obfuscatorFuns(COMMENT_OBFUSCATE_MAPS, CommentModel));
