export interface OtherUserResponse {
  id: string;
  avatarUrl?: string;
  bannerUrl?: string;
  nickname: string;
  isMe?: boolean;
}

export interface MyUser extends OtherUserResponse {
  username: string;
  email?: string;
}

