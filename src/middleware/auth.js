'use strict';

const env = require('../config/env');
const { extractToken, verifyToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

const authenticate = (req, _res, next) => {
  if (env.authBypass.enabled) {
    req.user = { ...env.authBypass.user, bypass: true };
    return next();
  }

  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Authentication required'));
  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(ApiError.unauthorized(message));
  }
};

const requireRole = (...roles) => (req, _res, next) => {
  if (env.authBypass.enabled) return next();
  if (!req.user) return next(ApiError.unauthorized('Authentication required'));
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
  return next();
};

const requireAdmin = requireRole('admin');

module.exports = { authenticate, requireRole, requireAdmin };
