'use strict';

const questions = new Map();

const questionRepository = {
  findById: async (id) => questions.get(id) || null,
  findByExam: async (examId) => Array.from(questions.values()).filter((q) => q.examId === examId),
  create: async (question) => {
    questions.set(question.id, question);
    return question;
  },
  update: async (id, patch) => {
    const existing = questions.get(id);
    if (!existing) return null;
    const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    questions.set(id, merged);
    return merged;
  },
  delete: async (id) => questions.delete(id),
  deleteByExam: async (examId) => {
    let count = 0;
    for (const [id, q] of questions.entries()) {
      if (q.examId === examId) {
        questions.delete(id);
        count += 1;
      }
    }
    return count;
  },
  reset: () => questions.clear(),
};

module.exports = questionRepository;
