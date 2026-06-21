'use strict';

module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/utils/seed.js',
    '!src/config/logger.js',
  ],
  coverageDirectory: './coverage',
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
};
