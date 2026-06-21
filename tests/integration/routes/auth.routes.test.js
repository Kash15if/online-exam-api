'use strict';

const request = require('supertest');
const buildApp = require('../../../src/app');
const { resetAll } = require('../../helpers');

describe('auth routes', () => {
  let app;
  beforeEach(() => {
    resetAll();
    app = buildApp();
  });

  it('POST /api/auth/register creates a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'password123', name: 'Jane' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('POST /api/auth/register validates input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short', name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login returns a JWT for valid creds', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'password123', name: 'Jane' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('jane@example.com');
  });

  it('POST /api/auth/login rejects bad creds with 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'password123', name: 'Jane' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns the current user when authenticated', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'password123', name: 'Jane' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('jane@example.com');
  });
});
