'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload, options = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('generateToken: payload must be an object');
  }
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    ...options,
  });
};

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

const extractToken = (req) => {
  const raw = req.headers?.authorization || req.headers?.['x-access-token'] || '';
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value || value === 'null' || value === 'undefined') return null;
  if (value.toLowerCase().startsWith('bearer ')) return value.slice(7).trim() || null;
  return value;
};

module.exports = { generateToken, verifyToken, extractToken };
