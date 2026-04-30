const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || process.env.AUTHTOKEN;

const generateToken = (payload = {}, options = {}) => {
  const secret = getSecret();
  if (!secret) throw new Error('JWT secret not configured (set JWT_SECRET or AUTHTOKEN)');
  const signOptions = Object.assign({ expiresIn: process.env.JWT_EXPIRES_IN || '24h' }, options);
  return jwt.sign({ ...payload, iat: Math.floor(Date.now() / 1000) }, secret, signOptions);
};

const verifyToken = (token) => {
  const secret = getSecret();
  if (!secret) throw new Error('JWT secret not configured (set JWT_SECRET or AUTHTOKEN)');
  return jwt.verify(token, secret);
};

const extractToken = (req) => {
  const authHeader = (req.headers['authorization'] || req.headers['x-access-token'] || '').toString();
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  const parts = authHeader.split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : authHeader.trim();
};

module.exports = { generateToken, verifyToken, extractToken };
