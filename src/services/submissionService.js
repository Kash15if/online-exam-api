'use strict';

const { v4: uuidv4 } = require('uuid');

const {
  submissions: submissionRepository,
  questions: questionRepository,
  exams: examRepository,
} = require('../repositories');
const ApiError = require('../utils/ApiError');

const submitExam = async ({ userId, examId, answers }) => {
  const exam = await examRepository.findById(examId);
  if (!exam) throw ApiError.notFound('Exam not found');

  const questions = await questionRepository.findByExam(examId);
  if (questions.length === 0) throw ApiError.badRequest('Exam has no questions');

  const questionsById = new Map(questions.map((q) => [q.id, q]));
  const seen = new Set();

  let earned = 0;
  let total = 0;
  const details = [];

  for (const q of questions) {
    total += q.mark ?? 1;
  }

  for (const answer of answers) {
    if (seen.has(answer.questionId)) continue;
    seen.add(answer.questionId);

    const question = questionsById.get(answer.questionId);
    if (!question) continue;

    const isCorrect = question.correctAnswerIndex === answer.selectedIndex;
    if (isCorrect) earned += question.mark ?? 1;

    details.push({
      questionId: question.id,
      selectedIndex: answer.selectedIndex,
      correctIndex: question.correctAnswerIndex,
      isCorrect,
      mark: question.mark ?? 1,
    });
  }

  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
  const passed = percentage >= (exam.passingScore ?? 0);

  const submission = {
    id: uuidv4(),
    examId,
    userId,
    score: earned,
    totalMarks: total,
    percentage,
    passed,
    details,
    submittedAt: new Date().toISOString(),
  };

  return submissionRepository.create(submission);
};

const getSubmission = async (id, requestingUser) => {
  const submission = await submissionRepository.findById(id);
  if (!submission) throw ApiError.notFound('Submission not found');
  // A user can only view their own submission unless they are admin
  if (requestingUser.role !== 'admin' && submission.userId !== requestingUser.sub) {
    throw ApiError.forbidden('Not allowed to view this submission');
  }
  return submission;
};

const getUserSubmissions = async (userId, requestingUser) => {
  if (requestingUser.role !== 'admin' && requestingUser.sub !== userId) {
    throw ApiError.forbidden('Not allowed to view submissions for this user');
  }
  return submissionRepository.findByUser(userId);
};

module.exports = {
  submitExam,
  getSubmission,
  getUserSubmissions,
};
