import {ModelBase} from "./model-base";
import {UserModel} from "./user.model";

export abstract class TextContentModel extends ModelBase {
  authorId?: string;
  author?: UserModel;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  plusCount?: number;
  mentionIds?: string[];
}
