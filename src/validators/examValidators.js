'use strict';

const { body, param } = require('express-validator');

const idParam = () => [param('id').isUUID().withMessage('valid exam ID required')];

const createOrUpdateRules = () => [
  body('title').isString().trim().isLength({ min: 1, max: 255 }).withMessage('title required (1-255 chars)'),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('duration').isInt({ min: 1, max: 480 }).withMessage('duration must be 1-480 minutes'),
  body('passingScore').isInt({ min: 0, max: 100 }).withMessage('passingScore must be 0-100'),
];

module.exports = { idParam, createOrUpdateRules };
