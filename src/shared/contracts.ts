export interface MinimumUser{
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface UserResponse extends MinimumUser{
  bannerUrl?: string;
  circlerCount: number;
  blockedByMe: boolean;
  isMe?: boolean;
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
