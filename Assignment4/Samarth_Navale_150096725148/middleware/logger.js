function requestLogger(req, res, next) {
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = requestLogger;
