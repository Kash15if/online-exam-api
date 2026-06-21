'use strict';

const { body, param } = require('express-validator');

const idParam = () => [param('id').isUUID().withMessage('valid question ID required')];
const examIdParam = () => [param('examId').isUUID().withMessage('valid exam ID required')];

const createRules = () => [
  body('examId').isUUID().withMessage('valid examId required'),
  body('question').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('question text required'),
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('2-6 options required')
    .bail()
    .custom((options) => options.every((o) => typeof o === 'string' && o.trim().length > 0))
    .withMessage('every option must be a non-empty string'),
  body('correctAnswerIndex').isInt({ min: 0, max: 5 }).withMessage('correctAnswerIndex must be 0-5'),
  body('mark').optional().isInt({ min: 1, max: 100 }).withMessage('mark must be 1-100'),
];

const updateRules = () => [
  body('question').optional().isString().trim().isLength({ min: 1, max: 2000 }),
  body('options').optional().isArray({ min: 2, max: 6 }),
  body('correctAnswerIndex').optional().isInt({ min: 0, max: 5 }),
  body('mark').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { idParam, examIdParam, createRules, updateRules };
