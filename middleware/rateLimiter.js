const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { auth: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { auth: false, message: 'Too many login attempts, try again later.' },
  skipSuccessfulRequests: true
});

const examLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { auth: false, message: 'Too many exam submissions, try again later.' }
});

module.exports = { generalLimiter, authLimiter, examLimiter };
