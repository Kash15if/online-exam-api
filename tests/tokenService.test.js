const jwt = require('jsonwebtoken');

describe('tokenService', () => {
  const originalEnv = { JWT_SECRET: process.env.JWT_SECRET, AUTHTOKEN: process.env.AUTHTOKEN };
  let tokenService;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    delete require.cache[require.resolve('../services/tokenService')];
    tokenService = require('../services/tokenService');
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv.JWT_SECRET;
    process.env.AUTHTOKEN = originalEnv.AUTHTOKEN;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { sub: 'user123', role: 'student' };
      const token = tokenService.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include payload in token', () => {
      const payload = { sub: 'user456', role: 'admin' };
      const token = tokenService.generateToken(payload);
      const decoded = jwt.decode(token);

      expect(decoded.sub).toBe('user456');
      expect(decoded.role).toBe('admin');
    });

    it('should accept custom expiry options', () => {
      const token = tokenService.generateToken({ sub: 'test' }, { expiresIn: '1h' });
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { sub: 'user789' };
      const token = tokenService.generateToken(payload);
      const decoded = tokenService.verifyToken(token);

      expect(decoded.sub).toBe('user789');
    });

    it('should throw error for invalid token', () => {
      expect(() => tokenService.verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw error for tampered token', () => {
      const payload = { sub: 'user999' };
      const token = tokenService.generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      expect(() => tokenService.verifyToken(tamperedToken)).toThrow();
    });
  });

  describe('extractToken', () => {
    it('should extract Bearer token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
        }
      };
      const token = tokenService.extractToken(req);

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should extract token from x-access-token header', () => {
      const req = {
        headers: {
          'x-access-token': 'mytoken123'
        }
      };
      const token = tokenService.extractToken(req);

      expect(token).toBe('mytoken123');
    });

    it('should return null if no token found', () => {
      const req = { headers: {} };
      const token = tokenService.extractToken(req);

      expect(token).toBeNull();
    });

    it('should handle empty authorization header', () => {
      const req = {
        headers: {
          authorization: ''
        }
      };
      const token = tokenService.extractToken(req);

      expect(token).toBeNull();
    });
  });
});
