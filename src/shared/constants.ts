export const minPasswordLength = 6;
export const maxUsernameLength = 64;
export const minUsernameLength = 5;
const alphanumeric = '[a-zA-Z0-9]';
const seg = `(${alphanumeric}\\w*[\\-.]?)+\\w*${alphanumeric}`;
export const emailAddressPattern = `^(?=.{${minUsernameLength},${maxUsernameLength}}$)${seg}@${seg}$`;
export const usernamePattern = `^[a-zA-Z0-9_.@$\\-]{${minUsernameLength},${maxUsernameLength}}$`;
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
