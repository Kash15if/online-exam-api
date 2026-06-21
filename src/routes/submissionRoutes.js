'use strict';

const { Router } = require('express');

const submissionController = require('../controllers/submissionController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { examLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { examIdParam, idParam, userIdParam, submitRules } = require('../validators/submissionValidators');

const router = Router();

router.use(authenticate);

router.post(
  '/exam/:examId',
  examLimiter,
  examIdParam(),
  submitRules(),
  validate,
  asyncHandler(submissionController.submit),
);

router.get('/me', asyncHandler(submissionController.listMine));
router.get('/:id', idParam(), validate, asyncHandler(submissionController.getOne));
router.get('/user/:userId', requireAdmin, userIdParam(), validate, asyncHandler(submissionController.listForUser));

module.exports = router;
