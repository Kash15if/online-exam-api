const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { validate } = require('../middleware/validateInput');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const { verifyToken, extractToken } = require('../services/tokenService');

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ auth: false, message: 'Unauthorized' });
  try {
    req.user = verifyToken(token);
    req.payLoad = req.user;
    return next();
  } catch (err) {
    return res.status(401).json({ auth: false, message: 'Invalid token' });
  }
};

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
    body('name').trim().notEmpty().withMessage('name required')
  ],
  validate,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('valid email required'),
    body('password').notEmpty().withMessage('password required')
  ],
  validate,
  asyncHandler(authController.login)
);

router.post(
  '/refresh',
  authMiddleware,
  asyncHandler(authController.refreshToken)
);

module.exports = router;
