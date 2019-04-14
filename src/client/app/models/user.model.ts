import {ModelBase} from "./model-base";
import {API_URLS, DEFAULT_AVATAR_URL} from "../../constants";
import {HttpClient} from "@angular/common/http";
import {UserData} from "../../../shared/interf";

export class UserModel extends ModelBase {
  avatarUrl: string;
  nickname: string;

  constructor(http: HttpClient, userData?: UserData) {
    super(http);
    if (userData) {
      this.assign(userData);
    }
  }

  protected create(): Promise<void> {
    return undefined;
  }

  protected update(): Promise<void> {
    return undefined;
  }

  get avatar() {
    return this.avatarUrl || DEFAULT_AVATAR_URL;
  }

  get link() {
    return `u/${this.id}`;
  }

  assign(data: UserData) {

  }
}
