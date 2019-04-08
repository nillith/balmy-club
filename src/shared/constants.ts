export const minPasswordLength = 6;
export const maxUsernameLength = 64;
export const minUsernameLength = 5;
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
