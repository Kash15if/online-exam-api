'use strict';

const jwt = require('jsonwebtoken');
const tokenService = require('../../../src/services/tokenService');

describe('tokenService', () => {
  describe('generateToken', () => {
    it('signs a JWT with the given payload', () => {
      const token = tokenService.generateToken({ sub: 'u1', role: 'student' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = jwt.decode(token);
      expect(decoded.sub).toBe('u1');
      expect(decoded.role).toBe('student');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('throws if payload is not an object', () => {
      expect(() => tokenService.generateToken('not-an-object')).toThrow();
    });
  });

  describe('verifyToken', () => {
    it('returns the decoded payload for a valid token', () => {
      const token = tokenService.generateToken({ sub: 'u2' });
      const decoded = tokenService.verifyToken(token);
      expect(decoded.sub).toBe('u2');
    });

    it('throws for an invalid token', () => {
      expect(() => tokenService.verifyToken('not.a.token')).toThrow();
    });
  });

  describe('extractToken', () => {
    it('extracts a Bearer token from Authorization header', () => {
      expect(tokenService.extractToken({ headers: { authorization: 'Bearer abc.def.ghi' } })).toBe('abc.def.ghi');
    });

    it('is case-insensitive on the Bearer prefix', () => {
      expect(tokenService.extractToken({ headers: { authorization: 'bearer abc' } })).toBe('abc');
    });

    it('returns the raw token for x-access-token header', () => {
      expect(tokenService.extractToken({ headers: { 'x-access-token': 'tok-123' } })).toBe('tok-123');
    });

    it('returns null when no header is present', () => {
      expect(tokenService.extractToken({ headers: {} })).toBeNull();
    });

    it('returns null for empty / "null" / "undefined" values', () => {
      expect(tokenService.extractToken({ headers: { authorization: '' } })).toBeNull();
      expect(tokenService.extractToken({ headers: { authorization: 'null' } })).toBeNull();
      expect(tokenService.extractToken({ headers: { authorization: 'undefined' } })).toBeNull();
    });
  });
});
