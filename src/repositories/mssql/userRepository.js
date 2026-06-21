'use strict';

const { exec, getSql } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };

module.exports = {
  findByEmail: async (email) => {
    const sql = getSql();
    const result = await exec('SELECT TOP 1 * FROM users WHERE email = @email', {
      email: { type: sql.NVarChar(320), value: String(email).toLowerCase() },
    });
    return mapRow(result.recordset[0]);
  },

  findById: async (id) => {
    const sql = getSql();
    const result = await exec('SELECT TOP 1 * FROM users WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(result.recordset[0]);
  },

  create: async (user) => {
    const sql = getSql();
    await exec(
      `INSERT INTO users (id, email, name, password_hash, role, created_at)
       VALUES (@id, @email, @name, @passwordHash, @role, @createdAt)`,
      {
        id: { type: sql.UniqueIdentifier, value: user.id },
        email: { type: sql.NVarChar(320), value: user.email.toLowerCase() },
        name: { type: sql.NVarChar(200), value: user.name },
        passwordHash: { type: sql.NVarChar(255), value: user.passwordHash },
        role: { type: sql.NVarChar(20), value: user.role },
        createdAt: { type: sql.DateTime2, value: new Date(user.createdAt) },
      },
    );
    return user;
  },

  list: async () => {
    const result = await exec('SELECT * FROM users ORDER BY created_at ASC');
    return result.recordset.map(mapRow);
  },

  reset: async () => {
    await exec('DELETE FROM users');
  },
};
