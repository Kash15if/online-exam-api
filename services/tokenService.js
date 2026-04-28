const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || process.env.AUTHTOKEN;

const generateToken = (payload = {}, options = {}) => {
  if (!SECRET) throw new Error('JWT secret not configured (set JWT_SECRET or AUTHTOKEN)');
  const signOptions = Object.assign({ expiresIn: process.env.JWT_EXPIRES_IN || '24h' }, options);
  return jwt.sign({ ...payload, iat: Math.floor(Date.now() / 1000) }, SECRET, signOptions);
};

const verifyToken = (token) => {
  if (!SECRET) throw new Error('JWT secret not configured (set JWT_SECRET or AUTHTOKEN)');
  return jwt.verify(token, SECRET);
};

const extractToken = (req) => {
  const authHeader = (req.headers['authorization'] || req.headers['x-access-token'] || '').toString();
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  const parts = authHeader.split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : authHeader.trim();
};

module.exports = { generateToken, verifyToken, extractToken };
