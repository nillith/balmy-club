export enum SignUpTypes {
  Request, WithToken, Direct
}

export interface AuthPayload {
  email?: string;
  username?: string;
  password?: string;
  token?: string;
  type?: number;
  rememberMe?: boolean;
}

export interface AccessTokenContent {
  id: string,
  username: string,
  role: string,
  iat: number,
  exp: number
}

