'use strict';

const env = require('../config/env');
const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = status >= 500 && env.isProduction ? 'Internal server error' : err.message || 'Internal server error';

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} →`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${status} ${message}`);
  }

  const body = {
    success: false,
    error: { status, message },
  };
  if (err.details) body.error.details = err.details;
  if (!env.isProduction && status >= 500) body.error.stack = err.stack;

  return res.status(status).json(body);
};

module.exports = errorHandler;
