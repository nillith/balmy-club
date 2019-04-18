import {PostVisibilities} from "./interf";

export interface MinimumUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  isMe?: boolean;
}

export interface UserResponse extends MinimumUser {
  bannerUrl?: string;
  circlerCount: number;
  blockedByMe: boolean;
}


export interface IResponse extends UserResponse {
  username: string;
  email?: string;
}

export interface CircleResponse {
  id: string;
  name: string;
  userCount: number;
  users?: MinimumUser[];
}

export const enum SignUpTypes {
  Email = 1, WithToken, Direct
}

interface SignUpInfo {
  username: string;
  nickname: string;
  password: string;
  email?: string;
}

export interface DirectSignUpRequest extends SignUpInfo {
  type: SignUpTypes.Direct;
}

export interface EmailSignUpRequest {
  email: string;
  type: SignUpTypes.Email;
}

export interface SignUpWithTokenRequest extends SignUpInfo {
  token: string;
  type: SignUpTypes.WithToken;
}

export type SignUpRequest = DirectSignUpRequest | EmailSignUpRequest | SignUpWithTokenRequest;

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: IResponse;
  circles: CircleResponse[];
}

export interface ChangeSettingsRequest {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  username?: string;
  nickname?: string;
  avatarUrl?: string;
}


export interface PublishPostRequest {
  reShareFromPostId: string;
  visibility: PostVisibilities;
  content: string;
  visibleCircleIds?: string[];
}

export interface PublishCommentRequest {
  postId: string;
  content: string;
}


export interface TextContentResponse {
  id: string;
  authorId: string;
  content: string;
  plusCount: number;
  createdAt: number;
  authorNickname: string;
  authorAvatarUrl: string;
  plusedByMe?: boolean;
}

export interface CommentResponse extends TextContentResponse {
  postId: string;
}

export interface PostResponse extends TextContentResponse {
  reShareFromPostId: string;
  visibility: PostVisibilities;
  reShareCount: number;
  comments: CommentResponse[];
}
