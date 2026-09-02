const requestLogger = (req, res, next) => {
  const ts = new Date().toISOString();
  const m = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;

  res.on('finish', () => {
    const u = req.user ? `${req.user.userId}(${req.user.role})` : 'guest';
    console.log(`[${ts}] ${m} ${url} ${res.statusCode} ${u} - ${ip}`);
  });

  next();
};

module.exports = requestLogger;

