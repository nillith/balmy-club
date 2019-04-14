import {isValidPostContent, isValidTimestamp} from "../../shared/utils";
import {
  $authorId,
  $obfuscator,
  $reShareFromPostId,
  $visibleCircleIds,
  postObfuscator,
} from "../service/obfuscator.service";
import {isValidPostVisibility, PostVisibilities} from "../../shared/interf";
import {Connection} from 'mysql2/promise';
import {devOnly, isNumericId} from "../utils/index";
import {TextContentModel} from "./text-content.model";
import _ from 'lodash';

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
  reShareFromPostId?: number | string;
  [$reShareFromPostId]?: string;
  visibility?: PostVisibilities;
  [$authorId]?: string;
  [$visibleCircleIds]?: string[];
  visibleCircleIds?: (number[]) | (string[]);
  reShareCount?: number;

  async insertIntoDatabase(con: Connection): Promise<void> {
    const self = this;
    assertValidNewModel(self);

    let replacements: any;
    if (_.isEmpty(self.mentionIds)) {
      replacements = self;
    } else {
      replacements = Object.create(self);
      replacements.mentionIds = JSON.stringify(self.mentionIds);
    }

    await self.insertIntoDatabaseAndRetrieveId(con, INSERT_SQL, replacements);
  }
}

