'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const env = require('../config/env');
const logger = require('../config/logger');
const {
  users: userRepository,
  exams: examRepository,
  questions: questionRepository,
} = require('../repositories');

const seedBypassUser = async () => {
  if (!env.authBypass.enabled) return;
  const { sub, email, name, role } = env.authBypass.user;
  if (await userRepository.findByEmail(email)) return;
  const passwordHash = await bcrypt.hash('bypass-disabled-password', 4);
  await userRepository.create({
    id: sub,
    email,
    name,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });
  logger.warn(`AUTH_BYPASS enabled - seeded bypass user "${email}" (role=${role}). Do NOT use in production.`);
};

const seed = async () => {
  await seedBypassUser();
  // Default admin
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  if (!(await userRepository.findByEmail(adminEmail))) {
    const passwordHash = await bcrypt.hash(adminPassword, env.bcryptSaltRounds);
    await userRepository.create({
      id: uuidv4(),
      email: adminEmail,
      name: 'Administrator',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    logger.info(`Seeded admin user: ${adminEmail}`);
  }

  // Default student
  const studentEmail = (process.env.SEED_STUDENT_EMAIL || 'student@example.com').toLowerCase();
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@12345';
  if (!(await userRepository.findByEmail(studentEmail))) {
    const passwordHash = await bcrypt.hash(studentPassword, env.bcryptSaltRounds);
    await userRepository.create({
      id: uuidv4(),
      email: studentEmail,
      name: 'Demo Student',
      passwordHash,
      role: 'student',
      createdAt: new Date().toISOString(),
    });
    logger.info(`Seeded student user: ${studentEmail}`);
  }

  // Demo exam (only if no exams exist)
  const exams = await examRepository.list();
  if (exams.length === 0) {
    const examId = uuidv4();
    const now = new Date().toISOString();
    await examRepository.create({
      id: examId,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics, ES6+, and the DOM.',
      duration: 30,
      passingScore: 60,
      createdAt: now,
      updatedAt: now,
    });

    const questions = [
      {
        question: 'What does DOM stand for?',
        options: ['Document Object Model', 'Data Output Manager', 'Digital Object Module', 'Dynamic Output Model'],
        correctAnswerIndex: 0,
      },
      {
        question: 'Which keyword declares a block-scoped variable in modern JavaScript?',
        options: ['var', 'let', 'const', 'Both let and const'],
        correctAnswerIndex: 3,
      },
      {
        question: 'Which method adds an element to the end of an array?',
        options: ['shift()', 'unshift()', 'push()', 'pop()'],
        correctAnswerIndex: 2,
      },
      {
        question: 'What is the result of typeof null in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"number"'],
        correctAnswerIndex: 2,
      },
      {
        question: 'Which React hook lets you run side effects?',
        options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
        correctAnswerIndex: 1,
      },
    ];

    for (const q of questions) {
      await questionRepository.create({
        id: uuidv4(),
        examId,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        mark: 1,
        createdAt: now,
      });
    }
    logger.info(`Seeded demo exam (id=${examId}) with ${questions.length} questions`);
  }
};

module.exports = seed;
