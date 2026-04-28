const { v4: uuidv4 } = require('uuid');

const exams = new Map();
const questions = new Map();

const examService = {
  createExam: async (data) => {
    const id = uuidv4();
    const exam = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    exams.set(id, exam);
    return exam;
  },

  getExamById: async (id) => {
    const exam = exams.get(id);
    if (!exam) return null;
    const examQuestions = Array.from(questions.values()).filter(q => q.examId === id);
    return { ...exam, questions: examQuestions };
  },

  getAllExams: async () => {
    return Array.from(exams.values());
  },

  updateExam: async (id, data) => {
    const exam = exams.get(id);
    if (!exam) return null;
    const updated = { ...exam, ...data, updatedAt: new Date().toISOString() };
    exams.set(id, updated);
    return updated;
  },

  deleteExam: async (id) => {
    const deleted = exams.has(id);
    exams.delete(id);
    Array.from(questions.values()).forEach(q => {
      if (q.examId === id) questions.delete(q.id);
    });
    return deleted;
  }
};

module.exports = examService;
