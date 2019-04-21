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
    const _this = this;
    const data = await _this.http.post(API_URLS.MY_POSTS, _this.cloneModelFields([
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
    const _this = this;
    const data = await _this.http.post(`${API_URLS.POSTS}/${_this.id}/plus`, undefined, {responseType: 'text'}).toPromise();
  }
}
