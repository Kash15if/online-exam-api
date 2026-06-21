'use strict';

const request = require('supertest');

describe('AUTH_BYPASS=true', () => {
  let buildApp;
  let resetAll;
  let envCache;

  beforeAll(() => {
    envCache = process.env.AUTH_BYPASS;
    process.env.AUTH_BYPASS = 'true';

    // Load every module within an isolated module registry so we don't
    // leak the bypass-mode env into other test files.
    jest.isolateModules(() => {
      buildApp = require('../../../src/app');
      resetAll = require('../../helpers').resetAll;
    });
  });

  afterAll(() => {
    if (envCache === undefined) delete process.env.AUTH_BYPASS;
    else process.env.AUTH_BYPASS = envCache;
    jest.resetModules();
  });

  beforeEach(async () => {
    await resetAll();
  });

  it('skips authentication entirely on protected routes', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/exams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.exams)).toBe(true);
  });

  it('allows admin-only routes without a token', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/exams')
      .send({ title: 'Bypass exam', description: 'd', duration: 10, passingScore: 50 });
    expect(res.status).toBe(201);
    expect(res.body.exam.title).toBe('Bypass exam');
  });
});
