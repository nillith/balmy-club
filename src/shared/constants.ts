export const minPasswordLength = 6;
export const maxUsernameLength = 64;
export const minUsernameLength = 5;
const alphanumeric = '[a-zA-Z0-9]';
const seg = `(${alphanumeric}\\w*[\\-.]?)+\\w*${alphanumeric}`;
export const emailAddressPattern = `^(?=.{${minUsernameLength},${maxUsernameLength}}$)${seg}@${seg}$`;
export const usernamePattern = `[a-zA-Z0-9_.@$\\-]{${minUsernameLength},${maxUsernameLength}}`;
export const nicknamePattern = `[^;?:@=&#%|\\/^~(){}<>\`'",+$[\\]]{1,30}`;
export const mentionTrigger = '+';
export const idPattern = `[a-fA-F0-9]{32}`;
export const mentionPattern = `\\+\\[(${nicknamePattern})]\\((${idPattern})\\)`;
export const accessTokenKey = 'access_token';
export const accessTokenCookieKey = 'token';
export const Roles = {
  Admin: 'admin',
  User: 'user'
};

export const UserRanks = {
  [Roles.User]: 1,
  [Roles.Admin]: 2,
};
