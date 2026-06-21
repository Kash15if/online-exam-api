'use strict';

const { body, param } = require('express-validator');

const examIdParam = () => [param('examId').isUUID().withMessage('valid exam ID required')];
const idParam = () => [param('id').isUUID().withMessage('valid submission ID required')];
const userIdParam = () => [param('userId').isUUID().withMessage('valid user ID required')];

const submitRules = () => [
  body('answers').isArray({ min: 1 }).withMessage('answers array required'),
  body('answers.*.questionId').isUUID().withMessage('valid questionId required'),
  body('answers.*.selectedIndex').isInt({ min: 0, max: 5 }).withMessage('selectedIndex must be 0-5'),
];

module.exports = { examIdParam, idParam, userIdParam, submitRules };
