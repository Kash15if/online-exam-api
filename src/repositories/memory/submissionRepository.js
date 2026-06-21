'use strict';

const submissions = new Map();

const submissionRepository = {
  findById: async (id) => submissions.get(id) || null,
  findByUser: async (userId) => Array.from(submissions.values()).filter((s) => s.userId === userId),
  findByExamAndUser: async (examId, userId) =>
    Array.from(submissions.values()).filter((s) => s.examId === examId && s.userId === userId),
  create: async (submission) => {
    submissions.set(submission.id, submission);
    return submission;
  },
  reset: () => submissions.clear(),
};

module.exports = submissionRepository;
