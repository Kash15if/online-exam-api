const { generateToken } = require('../services/tokenService');

const users = new Map();
users.set('test@example.com', {
  id: '1',
  email: 'test@example.com',
  password: 'hashedpass123',
  role: 'student'
});

const authService = {
  register: async (email, password, name) => {
    if (users.has(email)) {
      const err = new Error('User already exists');
      err.status = 409;
      throw err;
    }
    const userId = Math.random().toString(36).substr(2, 9);
    const user = { id: userId, email, password, name, role: 'student', createdAt: new Date().toISOString() };
    users.set(email, user);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },

  login: async (email, password) => {
    const user = users.get(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
    if (user.password !== password) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
    const token = generateToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  },

  getUserById: async (id) => {
    const user = Array.from(users.values()).find(u => u.id === id);
    if (!user) return null;
    // eslint-disable-next-line no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }
};

module.exports = authService;
