'use strict';

const env = require('./src/config/env');
const logger = require('./src/config/logger');
const buildApp = require('./src/app');
const seed = require('./src/utils/seed');

const closeDriver = async () => {
  try {
    if (env.repositoryDriver === 'postgres') {
      await require('./src/repositories/postgres/client').close();
    } else if (env.repositoryDriver === 'mssql') {
      await require('./src/repositories/mssql/client').close();
    }
  } catch (err) {
    logger.error('Error closing DB pool:', err);
  }
};

const start = async () => {
  if (env.seedOnBoot) {
    await seed();
  } else {
    logger.info('SEED_ON_BOOT=false - skipping seed step.');
  }
  const app = buildApp();
  const server = app.listen(env.port, () => {
    logger.info(`Online Exam API running on port ${env.port}`);
    logger.info(`Environment: ${env.nodeEnv}`);
    if (env.authBypass.enabled) {
      logger.warn('========================================================');
      logger.warn(' AUTH_BYPASS=true - all routes are open as a "bypass" user.');
      logger.warn(' This MUST never be enabled in production.');
      logger.warn('========================================================');
    }
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await closeDriver();
      logger.info('Server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    shutdown('uncaughtException');
  });
};

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { start, buildApp };
