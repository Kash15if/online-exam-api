const authService = require('../services/authService');
const { generateToken } = require('../services/tokenService');

const authController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    return res.status(201).json({ auth: true, user });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    return res.json({ auth: true, token, user });
  },

  refreshToken: async (req, res) => {
    const user = req.user || req.payLoad;
    if (!user) return res.status(401).json({ auth: false, message: 'Unauthorized' });
    const token = generateToken({ sub: user.sub || user.id, role: user.role });
    return res.json({ auth: true, token });
  }
};

module.exports = authController;
