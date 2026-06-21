'use strict';

const { Router } = require('express');

const questionController = require('../controllers/questionController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { idParam, examIdParam, createRules, updateRules } = require('../validators/questionValidators');

const router = Router();

router.use(authenticate);

router.get('/exam/:examId', examIdParam(), validate, asyncHandler(questionController.list));
router.get('/:id', idParam(), validate, asyncHandler(questionController.getOne));

router.post('/', requireAdmin, createRules(), validate, asyncHandler(questionController.create));
router.put('/:id', requireAdmin, idParam(), updateRules(), validate, asyncHandler(questionController.update));
router.delete('/:id', requireAdmin, idParam(), validate, asyncHandler(questionController.remove));

module.exports = router;
