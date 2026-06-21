'use strict';

const exams = new Map();

const examRepository = {
  findById: async (id) => exams.get(id) || null,
  list: async () => Array.from(exams.values()),
  create: async (exam) => {
    exams.set(exam.id, exam);
    return exam;
  },
  update: async (id, patch) => {
    const existing = exams.get(id);
    if (!existing) return null;
    const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    exams.set(id, merged);
    return merged;
  },
  delete: async (id) => exams.delete(id),
  reset: () => exams.clear(),
};

module.exports = examRepository;
