'use strict';

const express = require('express');
const morgan = require('morgan');

const env = require('./config/env');
const { securityHeaders, corsConfig } = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const routes = require('./routes');

const buildApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(corsConfig);
  app.use(generalLimiter);
  app.use(express.json({ limit: env.bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: env.bodyLimit }));

  if (!env.isTest) {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  app.use('/api', routes);
  app.get('/', (_req, res) => res.json({ success: true, message: 'Online Exam API. See /api/health' }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = buildApp;
