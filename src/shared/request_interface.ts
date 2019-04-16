import {SignUpTypes} from "./constants";

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
