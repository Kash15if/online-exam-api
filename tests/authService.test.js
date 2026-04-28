const authService = require('../services/authService');

describe('authService', () => {
  beforeEach(() => {
    // Reset users map by clearing it
    authService.__resetForTesting?.();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = await authService.register('newuser@example.com', 'password123', 'New User');

      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.name).toBe('New User');
      expect(user.role).toBe('student');
      expect(user.id).toBeDefined();
    });

    it('should not include password in response', async () => {
      const user = await authService.register('user@test.com', 'secret', 'Test');

      expect(user.password).toBeUndefined();
    });

    it('should throw error if user already exists', async () => {
      await authService.register('duplicate@test.com', 'pass1', 'User1');

      await expect(authService.register('duplicate@test.com', 'pass2', 'User2')).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register('login@test.com', 'password123', 'Login User');
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login('login@test.com', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@test.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(authService.login('nonexistent@test.com', 'password123')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for incorrect password', async () => {
      await expect(authService.login('login@test.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    it('should return token in response', async () => {
      const result = await authService.login('login@test.com', 'password123');

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const registered = await authService.register('getuser@test.com', 'pass', 'Get User');
      const user = await authService.getUserById(registered.id);

      expect(user).toBeDefined();
      expect(user.email).toBe('getuser@test.com');
      expect(user.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      const user = await authService.getUserById('nonexistent-id');

      expect(user).toBeNull();
    });
  });
});
