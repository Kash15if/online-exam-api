'use strict';

const { body } = require('express-validator');

const registerRules = () => [
  body('email').isEmail().withMessage('valid email required').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage('password must be 8-128 characters'),
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('name required (1-100 chars)'),
];

const loginRules = () => [
  body('email').isEmail().withMessage('valid email required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('password required'),
];

module.exports = { registerRules, loginRules };
