const jwt = require('jsonwebtoken');

/**
 * authGuard middleware
 * Requirement:
 * - Validates Bearer token from Authorization header
 * - Returns 401 for missing, malformed, or invalid tokens
 * - Attaches decoded attendee information to req.user
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Bearer token is missing.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Token is malformed.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'eventhub_jwt_secret_key_itue301_d25it126_exam';
    const decoded = jwt.verify(token, secret);

    // Attach decoded user payload to request
    req.user = decoded; // Contains: { id, email, role, name }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Token is invalid or has expired.',
      error: error.message,
    });
  }
};

module.exports = authGuard;
