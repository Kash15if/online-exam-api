'use strict';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const buildApp = require('../../../src/app');
const { users: userRepository } = require('../../../src/repositories');
const tokenService = require('../../../src/services/tokenService');
const { resetAll } = require('../../helpers');

const seedUser = async (role, email) => {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash('password123', 4);
  await userRepository.create({
    id,
    email,
    name: role,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });
  return { id, token: tokenService.generateToken({ sub: id, role, email }) };
};

describe('submission routes', () => {
  let app;
  let admin;
  let student;
  let examId;
  let questionId;

  beforeEach(async () => {
    resetAll();
    app = buildApp();
    admin = await seedUser('admin', 'admin@example.com');
    student = await seedUser('student', 'student@example.com');

    const exam = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'Quiz', duration: 10, passingScore: 50 });
    examId = exam.body.exam.id;

    const question = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        examId,
        question: 'Pick A',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 0,
      });
    questionId = question.body.question.id;
  });

  it('students can submit and see their score', async () => {
    const res = await request(app)
      .post(`/api/submissions/exam/${examId}`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ answers: [{ questionId, selectedIndex: 0 }] });

    expect(res.status).toBe(201);
    expect(res.body.submission.score).toBe(1);
    expect(res.body.submission.passed).toBe(true);
  });

  it('students cannot view another user’s submissions list', async () => {
    const other = await seedUser('student', 'other@example.com');
    const res = await request(app)
      .get(`/api/submissions/user/${other.id}`)
      .set('Authorization', `Bearer ${student.token}`);
    // Only admin can list per-user; non-admin → 403
    expect(res.status).toBe(403);
  });

  it('students can list their own submissions via /me', async () => {
    await request(app)
      .post(`/api/submissions/exam/${examId}`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ answers: [{ questionId, selectedIndex: 0 }] });

    const res = await request(app)
      .get('/api/submissions/me')
      .set('Authorization', `Bearer ${student.token}`);

    expect(res.status).toBe(200);
    expect(res.body.submissions).toHaveLength(1);
  });

  it('admins can list submissions for any user', async () => {
    await request(app)
      .post(`/api/submissions/exam/${examId}`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ answers: [{ questionId, selectedIndex: 0 }] });

    const res = await request(app)
      .get(`/api/submissions/user/${student.id}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(200);
    expect(res.body.submissions).toHaveLength(1);
  });
});
