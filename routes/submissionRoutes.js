const express = require('express');
const { param } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { validate, questionValidation } = require('../middleware/validateInput');
const questionController = require('../controllers/questionController');
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

const adminMiddleware = (req, res, next) => {
  if ((req.user?.role || req.payLoad?.role) !== 'admin') {
    return res.status(403).json({ auth: false, message: 'Admin access required' });
  }
  return next();
};

router.get(
  '/exam/:examId',
  [param('examId').isUUID().withMessage('valid exam ID required')],
  validate,
  authMiddleware,
  asyncHandler(questionController.getExamQuestions)
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('valid question ID required')],
  validate,
  authMiddleware,
  asyncHandler(questionController.getQuestion)
);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  questionValidation,
  validate,
  asyncHandler(questionController.addQuestion)
);

router.put(
  '/:id',
  [param('id').isUUID().withMessage('valid question ID required')],
  validate,
  authMiddleware,
  adminMiddleware,
  questionValidation,
  validate,
  asyncHandler(questionController.updateQuestion)
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('valid question ID required')],
  validate,
  authMiddleware,
  adminMiddleware,
  asyncHandler(questionController.deleteQuestion)
);

module.exports = router;
