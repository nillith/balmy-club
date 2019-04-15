import {isValidPostContent, isValidTimestamp} from "../../shared/utils";
import {
  $authorId,
  $obfuscator,
  $reShareFromPostId,
  $visibleCircleIds,
  obfuscatorFuns,
  POST_OBFUSCATE_MAPS,
  postObfuscator,
} from "../service/obfuscator.service";
import {isValidPostVisibility, PostVisibilities} from "../../shared/interf";
import {Connection} from 'mysql2/promise';
import {devOnly, isNumericId, undefinedToNull} from "../utils/index";
import {TextContentModel} from "./text-content.model";
import _ from 'lodash';
import {DatabaseDriver} from "./model-base";
import db from "../persistence/index";

const assertValidNewModel = devOnly(function(model: PostModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isNumericId(model.authorId), `invalid authorId: ${model.authorId}`);
  console.assert(!model.reShareFromPostId || isNumericId(model.reShareFromPostId), `invalid reShareFromPostId: ${model.reShareFromPostId}`);
  console.assert(isValidPostVisibility(model.visibility), `invalid visibility: ${model.visibility}`);
  console.assert(isValidPostContent(model.content), `invalid content`);
  console.assert(isValidTimestamp(model.createdAt), `invalid timestamp ${model.createdAt}`);
});

const INSERT_SQL = `INSERT INTO Posts (authorId, reShareFromPostId, content, createdAt, visibility, mentionIds) VALUES(:authorId, :reShareFromPostId, :content, :createdAt, :visibility, :mentionIds)`;

export class PostModel extends TextContentModel {
  static readonly [$obfuscator] = postObfuscator;

  static unObfuscateFrom(obj: any): PostModel | undefined {
    throw Error('Not implemented');
  }

  reShareFromPostId?: number | string;
  [$reShareFromPostId]?: string;
  visibility?: PostVisibilities;
  [$authorId]?: string;
  [$visibleCircleIds]?: string[];
  visibleCircleIds?: (number[]) | (string[]);
  reShareCount?: number;

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
