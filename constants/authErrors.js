/** Static auth error response shape for all APIs. Frontend can check `code` to e.g. trigger refresh. */
const authError = (code, message) => ({ success: false, code, message });

module.exports = {
  NO_TOKEN: authError('NO_TOKEN', 'No token provided or invalid format'),
  INVALID_TOKEN: authError('INVALID_TOKEN', 'Invalid token'),
  TOKEN_EXPIRED: authError('TOKEN_EXPIRED', 'Token expired'),
  USER_NOT_FOUND: authError('USER_NOT_FOUND', 'User not found'),
};
