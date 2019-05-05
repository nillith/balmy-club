export const MIN_PASSWORD_LENGTH = 6;
export const MAX_USERNAME_LENGTH = 64;
export const MIN_USERNAME_LENGTH = 5;
export const MAX_POST_LENGTH = 4096;
export const MAX_VISIBLE_CIRCLE_NUMBER = 20;
export const MAX_URL_LENGTH = 200;
export const POSTS_GROUP_SIZE = 12;
const ALPHA_NUMERIC = '[a-zA-Z0-9]';
const SEG = `(${ALPHA_NUMERIC}\\w*([\\-.]?\\w*${ALPHA_NUMERIC})*)`;
export const EMAIL_ADDRESS_PATTERN = `(?=.{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}$)${SEG}@${SEG}\.${SEG}`;
export const USERNAME_PATTERN = `[a-zA-Z0-9_.@$\\-]{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}`;
export const NICKNAME_PATTERN = `[^;?:@=&#%|\\/^~(){}<>\`'",+$[\\]]{1,30}`;
export const CIRCLE_NAME_PATTERN = NICKNAME_PATTERN;
export const MENTION_TRIGGER = '+';
export const ID_PATTERN = `[a-fA-F0-9]{32}`;
export const MENTION_PATTERN = `\\+\\[(${NICKNAME_PATTERN})]\\((${ID_PATTERN})\\)`;
export const ACCESS_TOKEN_KEY = 'access_token';
export const ACCESS_TOKEN_COOKIE_KEY = 'token';

export const Roles = {
  Admin: 'admin',
  User: 'user'
};

export const UserRanks = {
  [Roles.User]: 1,
  [Roles.Admin]: 2,
};
export const PING = 'PING';
export const PONG = 'PONG';
export const AUTH = 'AUTH';


export const RemoteMessageTypes = {
  // client side only start
  Token: 1,
  Read: 2,
  Logout: 3,
  // client side only end


  Sync: 100,
  Notification: 101,
};

export const PagePaths = {
  ResetPassword: 'i/reset-password',
  SignUp: 'sign-up',
  Login: 'login',
};
