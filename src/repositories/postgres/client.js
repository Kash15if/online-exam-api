'use strict';

const env = require('../../config/env');
const logger = require('../../config/logger');

let pool = null;

const getPool = () => {
  if (pool) return pool;

  // Lazy-require so `pg` is only needed when the postgres driver is selected.
  // eslint-disable-next-line global-require
  const { Pool } = require('pg');

  const config = env.postgres.connectionString
    ? { connectionString: env.postgres.connectionString, max: env.postgres.max }
    : {
        host: env.postgres.host,
        port: env.postgres.port,
        user: env.postgres.user,
        password: env.postgres.password,
        database: env.postgres.database,
        max: env.postgres.max,
        ssl: env.postgres.ssl ? { rejectUnauthorized: false } : false,
      };

  pool = new Pool(config);
  pool.on('error', (err) => logger.error('Postgres pool error:', err));
  return pool;
};

const query = async (text, params) => {
  const result = await getPool().query(text, params);
  return result;
};

const close = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = { getPool, query, close };
