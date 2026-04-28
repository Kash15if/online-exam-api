const submissionService = require('../services/submissionService');
const examService = require('../services/examService');

const submissionController = {
  submitExam: async (req, res) => {
    const { examId, answers } = req.body;
    const userId = req.user?.sub || req.user?.id || req.payLoad?.sub;

    const exam = await examService.getExamById(examId);
    if (!exam) return res.status(404).json({ auth: false, message: 'Exam not found' });

    const questionsData = exam.questions || [];
    const submission = await submissionService.submitExam(userId, examId, answers, questionsData);

    return res.json({ auth: true, submission });
  },

  getSubmission: async (req, res) => {
    const submission = await submissionService.getSubmission(req.params.submissionId);
    if (!submission) return res.status(404).json({ auth: false, message: 'Submission not found' });
    return res.json({ auth: true, submission });
  },

  getUserSubmissions: async (req, res) => {
    const userId = req.user?.sub || req.user?.id || req.payLoad?.sub;
    const submissions = await submissionService.getUserSubmissions(userId);
    return res.json({ auth: true, submissions });
  }
};

module.exports = submissionController;
