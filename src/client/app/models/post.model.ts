import {TextContentModel} from "./text-content.model";
import {CommentModel} from "./comment.model";
import {PostData, PostVisibilities} from "../../../shared/interf";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";

export class PostModel extends TextContentModel {
  comments?: CommentModel[];
  reShareFromPostId?: string;
  reShareCount?: number;
  visibility?: number = PostVisibilities.Public;
  visibleCircleIds?: string[];

  constructor(http: HttpClient) {
    super(http);
  }

  protected async create(): Promise<void> {
    const self = this;
    const data = await self.http.post(API_URLS.POSTS, self.cloneModelFields([
      'content',
      'reShareFromPostId',
      'visibility',
      'visibleCircleIds',
    ]), {responseType: 'text'}).toPromise();
  }

  protected update(): Promise<void> {
    return undefined;
  }

  async plusOne() {
    const self = this;
    const data = await self.http.post(`${API_URLS.POSTS}/${self.id}/plus`, undefined, {responseType: 'text'}).toPromise();
  }
}
