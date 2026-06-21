'use strict';

const { Router } = require('express');

const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules } = require('../validators/authValidators');

const router = Router();

router.post('/register', authLimiter, registerRules(), validate, asyncHandler(authController.register));
router.post('/login', authLimiter, loginRules(), validate, asyncHandler(authController.login));
router.post('/refresh', authenticate, asyncHandler(authController.refresh));
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
