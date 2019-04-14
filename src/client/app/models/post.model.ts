import {TextContentModel} from "./text-content.model";
import {CommentModel} from "./comment.model";
import {PostData} from "../../../shared/interf";

export class PostModel extends TextContentModel {
  comments?: CommentModel[];
  reShareFromPostId?: string;
  reShareCount?: number;
  visibility?: number;
  visibleCircleIds?: string[];

  protected async create(): Promise<void> {
    const self = this;
    const data = await self.http.post(self.apiUrl, self.cloneFields([
      'content',
      'reShareFromPostId',
      'visibility',
      'visibleCircleIds',
    ])).toPromise() as PostData;
  }

  protected update(): Promise<void> {
    return undefined;
  }
}
