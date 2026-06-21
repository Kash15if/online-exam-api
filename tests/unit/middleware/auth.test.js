'use strict';

const { authenticate, requireAdmin } = require('../../../src/middleware/auth');
const tokenService = require('../../../src/services/tokenService');

describe('auth middleware', () => {
  describe('authenticate', () => {
    it('attaches the decoded user to req when token is valid', () => {
      const token = tokenService.generateToken({ sub: 'u1', role: 'student' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();
      authenticate(req, {}, next);
      expect(req.user).toMatchObject({ sub: 'u1', role: 'student' });
      expect(next).toHaveBeenCalledWith();
    });

    it('returns 401 when no token is present', () => {
      const next = jest.fn();
      authenticate({ headers: {} }, {}, next);
      expect(next.mock.calls[0][0].status).toBe(401);
    });

    it('returns 401 for an invalid token', () => {
      const next = jest.fn();
      authenticate({ headers: { authorization: 'Bearer not-a-valid-token' } }, {}, next);
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });

  describe('requireAdmin', () => {
    it('allows admin users through', () => {
      const next = jest.fn();
      requireAdmin({ user: { role: 'admin' } }, {}, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('forbids non-admins', () => {
      const next = jest.fn();
      requireAdmin({ user: { role: 'student' } }, {}, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });

    it('returns 401 when no user is attached', () => {
      const next = jest.fn();
      requireAdmin({}, {}, next);
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });
});
