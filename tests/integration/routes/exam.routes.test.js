'use strict';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const buildApp = require('../../../src/app');
const { users: userRepository } = require('../../../src/repositories');
const tokenService = require('../../../src/services/tokenService');
const { resetAll } = require('../../helpers');

const seedUser = async (role) => {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash('password123', 4);
  await userRepository.create({
    id,
    email: `${role}@example.com`,
    name: role,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });
  return tokenService.generateToken({ sub: id, role, email: `${role}@example.com` });
};

describe('exam routes', () => {
  let app;
  let adminToken;
  let studentToken;

  beforeEach(async () => {
    resetAll();
    app = buildApp();
    adminToken = await seedUser('admin');
    studentToken = await seedUser('student');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/exams');
    expect(res.status).toBe(401);
  });

  it('students can list exams', async () => {
    const res = await request(app).get('/api/exams').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.exams)).toBe(true);
  });

  it('students cannot create an exam (403)', async () => {
    const res = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'X', duration: 10, passingScore: 50 });
    expect(res.status).toBe(403);
  });

  it('admins can create, update, and delete an exam', async () => {
    const create = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'New Exam', description: 'Desc', duration: 30, passingScore: 60 });
    expect(create.status).toBe(201);
    const examId = create.body.exam.id;

    const update = await request(app)
      .put(`/api/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated', description: 'D', duration: 30, passingScore: 60 });
    expect(update.status).toBe(200);
    expect(update.body.exam.title).toBe('Updated');

    const remove = await request(app)
      .delete(`/api/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(remove.status).toBe(200);

    const after = await request(app)
      .get(`/api/exams/${examId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(after.status).toBe(404);
  });

  it('hides correctAnswerIndex from non-admin viewers', async () => {
    const create = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Quiz', duration: 10, passingScore: 50 });
    const examId = create.body.exam.id;

    await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        examId,
        question: 'Pick A',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 0,
      });

    const studentView = await request(app)
      .get(`/api/exams/${examId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentView.status).toBe(200);
    expect(studentView.body.exam.questions[0].correctAnswerIndex).toBeUndefined();

    const adminView = await request(app)
      .get(`/api/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminView.body.exam.questions[0].correctAnswerIndex).toBe(0);
  });
});
