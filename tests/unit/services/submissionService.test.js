'use strict';

const examService = require('../../../src/services/examService');
const questionService = require('../../../src/services/questionService');
const submissionService = require('../../../src/services/submissionService');
const { resetAll } = require('../../helpers');

const buildExam = async () => {
  const exam = await examService.createExam({
    title: 'Quiz',
    description: 'Test exam',
    duration: 10,
    passingScore: 50,
  });
  const q1 = await questionService.addQuestion({
    examId: exam.id,
    question: 'Q1?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    mark: 1,
  });
  const q2 = await questionService.addQuestion({
    examId: exam.id,
    question: 'Q2?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 1,
    mark: 2,
  });
  return { exam, q1, q2 };
};

describe('submissionService', () => {
  beforeEach(resetAll);

  it('scores a fully correct submission', async () => {
    const { exam, q1, q2 } = await buildExam();
    const submission = await submissionService.submitExam({
      userId: 'user-1',
      examId: exam.id,
      answers: [
        { questionId: q1.id, selectedIndex: 0 },
        { questionId: q2.id, selectedIndex: 1 },
      ],
    });
    expect(submission.score).toBe(3);
    expect(submission.totalMarks).toBe(3);
    expect(submission.percentage).toBe(100);
    expect(submission.passed).toBe(true);
    expect(submission.details).toHaveLength(2);
  });

  it('scores a partially correct submission', async () => {
    const { exam, q1, q2 } = await buildExam();
    const submission = await submissionService.submitExam({
      userId: 'user-1',
      examId: exam.id,
      answers: [
        { questionId: q1.id, selectedIndex: 1 },
        { questionId: q2.id, selectedIndex: 1 },
      ],
    });
    expect(submission.score).toBe(2);
    expect(submission.percentage).toBe(67);
    expect(submission.passed).toBe(true);
  });

  it('marks failed if percentage < passingScore', async () => {
    const { exam, q1, q2 } = await buildExam();
    const submission = await submissionService.submitExam({
      userId: 'user-1',
      examId: exam.id,
      answers: [
        { questionId: q1.id, selectedIndex: 3 },
        { questionId: q2.id, selectedIndex: 3 },
      ],
    });
    expect(submission.score).toBe(0);
    expect(submission.passed).toBe(false);
  });

  it('rejects submissions for a missing exam', async () => {
    await expect(
      submissionService.submitExam({
        userId: 'u',
        examId: '00000000-0000-0000-0000-000000000000',
        answers: [],
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects submissions for an exam without questions', async () => {
    const exam = await examService.createExam({
      title: 'Empty',
      description: '',
      duration: 5,
      passingScore: 50,
    });
    await expect(
      submissionService.submitExam({ userId: 'u', examId: exam.id, answers: [] }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('only allows owners (or admins) to view a submission', async () => {
    const { exam, q1 } = await buildExam();
    const submission = await submissionService.submitExam({
      userId: 'owner',
      examId: exam.id,
      answers: [{ questionId: q1.id, selectedIndex: 0 }],
    });

    await expect(
      submissionService.getSubmission(submission.id, { sub: 'attacker', role: 'student' }),
    ).rejects.toMatchObject({ status: 403 });

    const ownerView = await submissionService.getSubmission(submission.id, { sub: 'owner', role: 'student' });
    expect(ownerView.id).toBe(submission.id);

    const adminView = await submissionService.getSubmission(submission.id, { sub: 'someone', role: 'admin' });
    expect(adminView.id).toBe(submission.id);
  });
});
