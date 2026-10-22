/**
 * Global requestLogger middleware
 * Requirement: Logs incoming requests in format: [METHOD] [PATH] [TIMESTAMP]
 */
const requestLogger = (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl || req.url;
  const timestamp = new Date().toISOString();

  console.log(`[${method}] [${path}] [${timestamp}]`);
  next();
};

module.exports = requestLogger;
