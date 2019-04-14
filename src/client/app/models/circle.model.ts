import {ModelBase} from "./model-base";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "../../constants";
import {UserModel} from "./user.model";

const API_URL = API_URLS.CIRCLE;

export class CircleModel extends ModelBase {
  name?: string;
  users?: UserModel[];
  userIds?: string[];
  newUserIds: string[];
  deletedUserIds: string[];

  constructor(http: HttpClient, public ownerId: string) {
    super(http);
  }

  protected async create(): Promise<void> {
    const self = this;
    const data = await self.http.post(API_URL, {
      name: self.name,
      userIds: self.users && self.users.map(u => u.id)

    }).toPromise();
    console.log(data);
  }


  protected update(): Promise<void> {
    return undefined;
  }
}
