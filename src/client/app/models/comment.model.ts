import {TextContentModel} from "./text-content.model";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";


export class CommentModel extends TextContentModel {
  constructor(http: HttpClient, public postId: string) {
    super(http);
  }

  protected async create(): Promise<void> {
    const self = this;
    const data = await self.http.post(API_URLS.COMMENTS, self.cloneModelFields([
      'content',
      'postId',
    ]), {responseType: 'text'}).toPromise();
  }

  protected update(): Promise<void> {
    return undefined;
  }
}
