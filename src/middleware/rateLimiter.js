'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const buildLimiter = (cfg, message) =>
  rateLimit({
    windowMs: cfg.windowMs,
    max: cfg.max,
    message: { success: false, error: { status: 429, message } },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest,
  });

const generalLimiter = buildLimiter(env.rateLimit.general, 'Too many requests, please try again later.');
const authLimiter = buildLimiter(env.rateLimit.auth, 'Too many authentication attempts, please try again later.');
const examLimiter = buildLimiter(env.rateLimit.exam, 'Too many exam requests, please slow down.');

module.exports = { generalLimiter, authLimiter, examLimiter };
