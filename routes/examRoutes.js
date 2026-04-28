const express = require('express');
const { param } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { validate, examValidation } = require('../middleware/validateInput');
const examController = require('../controllers/examController');
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

router.get('/', authMiddleware, asyncHandler(examController.getAllExams));

router.get(
  '/:id',
  [param('id').isUUID().withMessage('valid exam ID required')],
  validate,
  authMiddleware,
  asyncHandler(examController.getExam)
);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  examValidation,
  validate,
  asyncHandler(examController.createExam)
);

router.put(
  '/:id',
  [param('id').isUUID().withMessage('valid exam ID required')],
  validate,
  authMiddleware,
  adminMiddleware,
  examValidation,
  validate,
  asyncHandler(examController.updateExam)
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('valid exam ID required')],
  validate,
  authMiddleware,
  adminMiddleware,
  asyncHandler(examController.deleteExam)
);

module.exports = router;
