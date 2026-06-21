'use strict';

require('dotenv').config();

const requiredInProduction = ['JWT_SECRET'];

const truthy = (val) => ['1', 'true', 'yes', 'on'].includes(String(val || '').toLowerCase());

const SUPPORTED_DRIVERS = ['memory', 'postgres', 'mssql'];
const repositoryDriver = (process.env.REPOSITORY_DRIVER || 'memory').toLowerCase();
if (!SUPPORTED_DRIVERS.includes(repositoryDriver)) {
  throw new Error(
    `Invalid REPOSITORY_DRIVER="${process.env.REPOSITORY_DRIVER}". Use one of: ${SUPPORTED_DRIVERS.join(', ')}`,
  );
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8081,
  jwtSecret: process.env.JWT_SECRET || process.env.AUTHTOKEN || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  repositoryDriver,
  postgres: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'online_exam',
    ssl: truthy(process.env.PG_SSL),
    max: parseInt(process.env.PG_POOL_MAX, 10) || 10,
  },
  mssql: {
    server: process.env.MSSQL_HOST || 'localhost',
    port: parseInt(process.env.MSSQL_PORT, 10) || 1433,
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || '',
    database: process.env.MSSQL_DATABASE || 'online_exam',
    encrypt: truthy(process.env.MSSQL_ENCRYPT),
    trustServerCertificate: truthy(process.env.MSSQL_TRUST_SERVER_CERTIFICATE) || true,
    poolMax: parseInt(process.env.MSSQL_POOL_MAX, 10) || 10,
  },
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimit: {
    general: { windowMs: 15 * 60 * 1000, max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100 },
    auth: { windowMs: 15 * 60 * 1000, max: 10 },
    exam: { windowMs: 60 * 1000, max: 30 },
  },
  bodyLimit: process.env.BODY_LIMIT || '50kb',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  seedOnBoot: process.env.SEED_ON_BOOT === undefined ? true : truthy(process.env.SEED_ON_BOOT),
  authBypass: {
    enabled: truthy(process.env.AUTH_BYPASS),
    user: {
      sub: process.env.AUTH_BYPASS_USER_ID || '00000000-0000-0000-0000-0000000000aa',
      email: process.env.AUTH_BYPASS_EMAIL || 'bypass@example.com',
      name: process.env.AUTH_BYPASS_NAME || 'Bypass User',
      role: ['admin', 'student'].includes(process.env.AUTH_BYPASS_ROLE)
        ? process.env.AUTH_BYPASS_ROLE
        : 'admin',
    },
  },
};

if (env.isProduction) {
  for (const key of requiredInProduction) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable in production: ${key}`);
    }
  }
  if (env.jwtSecret === 'dev-only-insecure-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
  if (env.authBypass.enabled) {
    throw new Error('AUTH_BYPASS=true is not allowed when NODE_ENV=production');
  }
}

module.exports = env;
