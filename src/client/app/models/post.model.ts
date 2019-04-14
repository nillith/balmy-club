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
    super(http, API_URLS.POST);
  }

  protected async create(): Promise<void> {
    const self = this;
    const data = await self.http.post(self.apiUrl, self.cloneFields([
      'content',
      'reShareFromPostId',
      'visibility',
      'visibleCircleIds',
    ]), {responseType: 'text'}).toPromise() as PostData;
  }

  protected update(): Promise<void> {
    return undefined;
  }
}
