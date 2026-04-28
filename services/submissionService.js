const { v4: uuidv4 } = require('uuid');

const submissions = new Map();

const submissionService = {
  submitExam: async (userId, examId, answers, questionsData) => {
    let correct = 0;
    const details = answers.map(ans => {
      const question = questionsData.find(q => q.id === ans.questionId);
      const isCorrect = question && question.correctAnswerIndex === ans.selectedIndex;
      if (isCorrect) correct += 1;
      return {
        questionId: ans.questionId,
        selectedIndex: ans.selectedIndex,
        correct: !!isCorrect,
        correctIndex: question?.correctAnswerIndex
      };
    });

    const score = questionsData.length > 0 ? Math.round((correct / questionsData.length) * 100) : 0;
    const submissionId = uuidv4();
    const submission = {
      submissionId,
      userId,
      examId,
      score,
      totalQuestions: questionsData.length,
      correct,
      details,
      submittedAt: new Date().toISOString()
    };
    submissions.set(submissionId, submission);
    return submission;
  },

  getSubmission: async (submissionId) => {
    return submissions.get(submissionId) || null;
  },

  getUserSubmissions: async (userId) => {
    return Array.from(submissions.values()).filter(s => s.userId === userId);
  }
};

module.exports = submissionService;
