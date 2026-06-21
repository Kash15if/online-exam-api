'use strict';

const authService = require('../../../src/services/authService');
const { resetAll } = require('../../helpers');

describe('authService', () => {
  beforeEach(resetAll);

  describe('register', () => {
    it('hashes the password and returns a sanitized user', async () => {
      const user = await authService.register({
        email: 'NewUser@Example.com',
        password: 'password123',
        name: 'New User',
      });
      expect(user).toMatchObject({
        email: 'newuser@example.com',
        name: 'New User',
        role: 'student',
      });
      expect(user.id).toBeDefined();
      expect(user.passwordHash).toBeUndefined();
    });

    it('throws conflict when registering the same email twice', async () => {
      await authService.register({ email: 'dup@example.com', password: 'password123', name: 'Dup' });
      await expect(
        authService.register({ email: 'dup@example.com', password: 'password123', name: 'Dup2' }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({ email: 'login@test.com', password: 'password123', name: 'Login User' });
    });

    it('returns a token and sanitized user with valid credentials', async () => {
      const result = await authService.login({ email: 'login@test.com', password: 'password123' });
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3);
      expect(result.user.email).toBe('login@test.com');
      expect(result.user.passwordHash).toBeUndefined();
    });

    it('rejects unknown email with 401', async () => {
      await expect(authService.login({ email: 'nope@test.com', password: 'password123' })).rejects.toMatchObject({
        status: 401,
      });
    });

    it('rejects wrong password with 401', async () => {
      await expect(authService.login({ email: 'login@test.com', password: 'wrong-password' })).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  describe('refresh', () => {
    it('issues a fresh token for a valid session', async () => {
      const created = await authService.register({
        email: 'refresh@test.com',
        password: 'password123',
        name: 'Refresh User',
      });
      const result = await authService.refresh({ sub: created.id, role: 'student' });
      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(created.id);
    });

    it('throws for an unknown user', async () => {
      await expect(authService.refresh({ sub: 'missing-id' })).rejects.toMatchObject({ status: 401 });
    });
  });
});
