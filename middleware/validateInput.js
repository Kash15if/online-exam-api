const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ auth: false, errors: errors.array() });
  }
  next();
};

// Return validation rule arrays as functions for lazy evaluation
const getExamValidation = () => [
  body('title').trim().notEmpty().withMessage('title required').isLength({ max: 255 }).withMessage('title max 255 chars'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('description max 1000 chars'),
  body('duration').isInt({ min: 1, max: 480 }).withMessage('duration 1-480 minutes'),
  body('passingScore').isInt({ min: 0, max: 100 }).withMessage('passingScore 0-100')
];

const getQuestionValidation = () => [
  body('examId').isUUID().withMessage('valid examId required'),
  body('question').trim().notEmpty().withMessage('question text required'),
  body('options').isArray({ min: 2, max: 6 }).withMessage('2-6 options required'),
  body('correctAnswerIndex').isInt({ min: 0 }).withMessage('valid correctAnswerIndex required'),
  body('mark').isInt({ min: 0 }).withMessage('mark required')
];

const getSubmitAnswerValidation = () => [
  body('examId').isUUID().withMessage('valid examId required'),
  body('answers').isArray({ min: 1 }).withMessage('answers array required'),
  body('answers.*.questionId').isUUID().withMessage('valid questionId required'),
  body('answers.*.selectedIndex').isInt({ min: 0 }).withMessage('valid selectedIndex required')
];

// Export both getter functions and direct references for backwards compatibility
const examValidation = getExamValidation();
const questionValidation = getQuestionValidation();
const submitAnswerValidation = getSubmitAnswerValidation();

module.exports = {
  validate,
  examValidation,
  questionValidation,
  submitAnswerValidation,
  getExamValidation,
  getQuestionValidation,
  getSubmitAnswerValidation
};
