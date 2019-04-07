let rankCounter = 0;
export const Roles = {
  Admin: 'admin',
  User: 'user'
};

export const constants = {
  userRoleRanks: {
    user: ++rankCounter,
    admin: ++rankCounter,
  }
};

export default constants;
