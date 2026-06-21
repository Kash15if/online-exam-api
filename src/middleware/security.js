'use strict';

const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'no-referrer' },
});

const corsConfig = cors({
  origin: (origin, cb) => {
    // Allow tools like curl/postman (no origin) and whitelisted origins
    if (!origin || env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

module.exports = { securityHeaders, corsConfig };
