const examService = require('../services/examService');

const examController = {
  createExam: async (req, res) => {
    const exam = await examService.createExam(req.body);
    return res.status(201).json({ auth: true, exam });
  },

  getExam: async (req, res) => {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ auth: false, message: 'Exam not found' });
    return res.json({ auth: true, exam });
  },

  getAllExams: async (req, res) => {
    const exams = await examService.getAllExams();
    return res.json({ auth: true, exams });
  },

  updateExam: async (req, res) => {
    const exam = await examService.updateExam(req.params.id, req.body);
    if (!exam) return res.status(404).json({ auth: false, message: 'Exam not found' });
    return res.json({ auth: true, exam });
  },

  deleteExam: async (req, res) => {
    const deleted = await examService.deleteExam(req.params.id);
    if (!deleted) return res.status(404).json({ auth: false, message: 'Exam not found' });
    return res.json({ auth: true, message: 'Exam deleted' });
  }
};

module.exports = examController;
