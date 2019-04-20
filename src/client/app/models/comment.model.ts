import {TextContentModel} from "./text-content.model";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";


export class CommentModel extends TextContentModel {
  constructor(http: HttpClient, public postId: string) {
    super(http);
  }

  protected async create(): Promise<void> {
    const _this = this;
    const data = await _this.http.post(API_URLS.MY_COMMENTS, _this.cloneModelFields([
      'content',
      'postId',
    ]), {responseType: 'text'}).toPromise();
  }

  protected update(): Promise<void> {
    return undefined;
  }
}
