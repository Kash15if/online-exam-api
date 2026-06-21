'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const env = require('../config/env');
const { users: userRepository } = require('../repositories');
const tokenService = require('./tokenService');
const ApiError = require('../utils/ApiError');

const sanitize = (user) => {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
};

const register = async ({ email, password, name }) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) throw ApiError.conflict('User already exists');

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = {
    id: uuidv4(),
    email: normalizedEmail,
    name,
    passwordHash,
    role: 'student',
    createdAt: new Date().toISOString(),
  };
  await userRepository.create(user);
  return sanitize(user);
};

const login = async ({ email, password }) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await userRepository.findByEmail(normalizedEmail);

  // Constant-time-ish: always run bcrypt to avoid timing oracle
  const placeholderHash = '$2a$10$placeholderplaceholderplaceholderplaceholder.placeholder';
  const valid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : (await bcrypt.compare(password, placeholderHash), false);

  if (!user || !valid) throw ApiError.unauthorized('Invalid email or password');

  const token = tokenService.generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { token, user: sanitize(user) };
};

const getUserById = async (id) => sanitize(await userRepository.findById(id));

const refresh = async (currentUser) => {
  if (!currentUser?.sub) throw ApiError.unauthorized('Invalid session');
  const user = await userRepository.findById(currentUser.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  const token = tokenService.generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { token, user: sanitize(user) };
};

module.exports = {
  register,
  login,
  getUserById,
  refresh,
  _sanitize: sanitize,
};
