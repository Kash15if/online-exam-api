const { v4: uuidv4 } = require('uuid');

const questions = new Map();

const questionService = {
  addQuestion: async (data) => {
    const id = uuidv4();
    const question = {
      id,
      ...data,
      createdAt: new Date().toISOString()
    };
    questions.set(id, question);
    return question;
  },

  getQuestionById: async (id) => {
    return questions.get(id) || null;
  },

  getQuestionsByExam: async (examId) => {
    return Array.from(questions.values()).filter(q => q.examId === examId);
  },

  updateQuestion: async (id, data) => {
    const question = questions.get(id);
    if (!question) return null;
    const updated = { ...question, ...data };
    questions.set(id, updated);
    return updated;
  },

  deleteQuestion: async (id) => {
    const deleted = questions.has(id);
    questions.delete(id);
    return deleted;
  }
};

module.exports = questionService;
