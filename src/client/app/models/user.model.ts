import {ModelBase} from "./model-base";
import {DEFAULT_AVATAR_URL} from "../../constants";
import {HttpClient} from "@angular/common/http";
import {UserData} from "../../../shared/interf";

export class UserModel extends ModelBase {
  static ASSIGN_FIELDS: string[] = [
    'id',
    'username',
    'nickname',
    'avatarUrl',
    'email',
  ];
  avatarUrl: string;
  nickname: string;
  username: string;
  email: string;
  isMe?: boolean;

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
}
