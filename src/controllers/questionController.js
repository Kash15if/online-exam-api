'use strict';

const questionService = require('../services/questionService');

const list = async (req, res) => {
  const questions = await questionService.getQuestionsByExam(req.params.examId);
  // Hide correctAnswerIndex from non-admins
  const safe = req.user?.role === 'admin'
    ? questions
    : questions.map(({ correctAnswerIndex, ...rest }) => rest); // eslint-disable-line no-unused-vars
  res.json({ success: true, questions: safe });
};

const getOne = async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);
  if (req.user?.role !== 'admin') {
    // eslint-disable-next-line no-unused-vars
    const { correctAnswerIndex, ...safe } = question;
    return res.json({ success: true, question: safe });
  }
  return res.json({ success: true, question });
};

const create = async (req, res) => {
  const question = await questionService.addQuestion(req.body);
  res.status(201).json({ success: true, question });
};

const update = async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  res.json({ success: true, question });
};

const remove = async (req, res) => {
  await questionService.deleteQuestion(req.params.id);
  res.json({ success: true, message: 'Question deleted' });
};

module.exports = { list, getOne, create, update, remove };
