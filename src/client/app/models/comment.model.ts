import {ModelBase} from "./model-base";

export class CommentModel extends ModelBase {
  postId?: string;
  protected create(): Promise<void> {
    return undefined;
  }

  protected update(): Promise<void> {
    return undefined;
  }
}
