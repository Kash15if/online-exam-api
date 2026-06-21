'use strict';

const env = require('../../config/env');
const logger = require('../../config/logger');

let pool = null;
let sqlLib = null;

const getSql = () => {
  if (!sqlLib) {
    // eslint-disable-next-line global-require
    sqlLib = require('mssql');
  }
  return sqlLib;
};

const getPool = async () => {
  if (pool && pool.connected) return pool;
  const sql = getSql();
  pool = new sql.ConnectionPool({
    server: env.mssql.server,
    port: env.mssql.port,
    user: env.mssql.user,
    password: env.mssql.password,
    database: env.mssql.database,
    pool: { max: env.mssql.poolMax },
    options: {
      encrypt: env.mssql.encrypt,
      trustServerCertificate: env.mssql.trustServerCertificate,
      enableArithAbort: true,
    },
  });
  pool.on('error', (err) => logger.error('MSSQL pool error:', err));
  await pool.connect();
  return pool;
};

/**
 * Execute a parameterized statement. Use named placeholders like @userId in the SQL
 * and pass values as { userId: { type: sql.UniqueIdentifier, value } }.
 */
const exec = async (text, params = {}) => {
  const conn = await getPool();
  const request = conn.request();
  for (const [name, spec] of Object.entries(params)) {
    if (spec && typeof spec === 'object' && 'type' in spec) {
      request.input(name, spec.type, spec.value);
    } else {
      request.input(name, spec);
    }
  }
  return request.query(text);
};

const close = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

module.exports = { exec, getPool, getSql, close };
