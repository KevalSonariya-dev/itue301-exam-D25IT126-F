/**
 * Global structured JSON error handling middleware
 * Placed as the very last middleware in the Express pipeline.
 * Returns structured JSON errors without exposing stack traces or secrets.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}: ${err.message}`);

  // 1. Custom status code if assigned or default to 500
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
};

module.exports = errorHandler;
