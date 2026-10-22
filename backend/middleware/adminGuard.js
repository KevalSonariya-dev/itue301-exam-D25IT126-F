/**
 * adminGuard middleware
 * 
 * Verifies that the authenticated user possesses the 'admin' role.
 * Must be executed AFTER authGuard has validated the Bearer token.
 * 
 * HTTP Responses:
 * - 401: If req.user is missing (unauthenticated)
 * - 403: If req.user.role is not 'admin' (forbidden)
 */
const adminGuard = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please sign in as an administrator.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required to access this resource.',
    });
  }

  next();
};

module.exports = adminGuard;
