const rateLimit = require('express-rate-limit');

const win = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

const apiRateLimiter = rateLimit({
  windowMs: win,
  max: limit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, try again later.'
  }
});

module.exports = apiRateLimiter;

