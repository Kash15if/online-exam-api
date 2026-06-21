'use strict';

// These env vars take precedence over `.env` because dotenv won't override
// values already present in process.env. Tests should always run against the
// memory driver with auth on, regardless of the local dev setup.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-prod';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.CORS_ORIGIN = '*';
process.env.LOG_LEVEL = 'error';
process.env.REPOSITORY_DRIVER = 'memory';
process.env.AUTH_BYPASS = 'false';
