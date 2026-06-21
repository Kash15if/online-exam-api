'use strict';

const { query } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };

module.exports = {
  findByEmail: async (email) => {
    const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
      String(email).toLowerCase(),
    ]);
    return mapRow(rows[0]);
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return mapRow(rows[0]);
  },

  create: async (user) => {
    await query(
      `INSERT INTO users (id, email, name, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, user.email.toLowerCase(), user.name, user.passwordHash, user.role, user.createdAt],
    );
    return user;
  },

  list: async () => {
    const { rows } = await query('SELECT * FROM users ORDER BY created_at ASC');
    return rows.map(mapRow);
  },

  reset: async () => {
    await query('TRUNCATE TABLE users CASCADE');
  },
};
