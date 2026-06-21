'use strict';

const { Router } = require('express');

const examController = require('../controllers/examController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { idParam, createOrUpdateRules } = require('../validators/examValidators');

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(examController.list));
router.get('/:id', idParam(), validate, asyncHandler(examController.getOne));

router.post('/', requireAdmin, createOrUpdateRules(), validate, asyncHandler(examController.create));
router.put('/:id', requireAdmin, idParam(), createOrUpdateRules(), validate, asyncHandler(examController.update));
router.delete('/:id', requireAdmin, idParam(), validate, asyncHandler(examController.remove));

module.exports = router;
