export const minPasswordLength = 6;
export const maxUsernameLength = 64;
export const minUsernameLength = 6;
export const usernamePattern = `^[a-zA-Z0-9_.@$\\-]{${minUsernameLength},${maxUsernameLength}}$`;
export const accessTokenKey = 'access_token';
export const accessTokenCookieKey = 'token';
