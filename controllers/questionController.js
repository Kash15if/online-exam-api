const questionService = require('../services/questionService');

const questionController = {
  addQuestion: async (req, res) => {
    const question = await questionService.addQuestion(req.body);
    return res.status(201).json({ auth: true, question });
  },

  getQuestion: async (req, res) => {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) return res.status(404).json({ auth: false, message: 'Question not found' });
    return res.json({ auth: true, question });
  },

  getExamQuestions: async (req, res) => {
    const questions = await questionService.getQuestionsByExam(req.params.examId);
    return res.json({ auth: true, questions });
  },

  updateQuestion: async (req, res) => {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    if (!question) return res.status(404).json({ auth: false, message: 'Question not found' });
    return res.json({ auth: true, question });
  },

  deleteQuestion: async (req, res) => {
    const deleted = await questionService.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ auth: false, message: 'Question not found' });
    return res.json({ auth: true, message: 'Question deleted' });
  }
};

module.exports = questionController;
