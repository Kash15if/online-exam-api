'use strict';

describe('repository dispatcher', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('loads the memory driver by default', () => {
    process.env.REPOSITORY_DRIVER = 'memory';
    const repos = require('../../../src/repositories');
    expect(repos.driver).toBe('memory');
    expect(repos.users).toBe(require('../../../src/repositories/memory/userRepository'));
    expect(repos.exams).toBe(require('../../../src/repositories/memory/examRepository'));
    expect(repos.questions).toBe(require('../../../src/repositories/memory/questionRepository'));
    expect(repos.submissions).toBe(require('../../../src/repositories/memory/submissionRepository'));
  });

  it('throws on an unknown driver in env config', () => {
    process.env.REPOSITORY_DRIVER = 'nope';
    expect(() => require('../../../src/config/env')).toThrow(/Invalid REPOSITORY_DRIVER/);
    process.env.REPOSITORY_DRIVER = 'memory';
  });

  it('exposes the same repository interface for postgres and mssql modules', () => {
    const expectedKeys = {
      users: ['findByEmail', 'findById', 'create', 'list', 'reset'],
      exams: ['findById', 'list', 'create', 'update', 'delete', 'reset'],
      questions: ['findById', 'findByExam', 'create', 'update', 'delete', 'deleteByExam', 'reset'],
      submissions: ['findById', 'findByUser', 'findByExamAndUser', 'create', 'reset'],
    };

    for (const driver of ['memory', 'postgres', 'mssql']) {
      const mods = {
        users: require(`../../../src/repositories/${driver}/userRepository`),
        exams: require(`../../../src/repositories/${driver}/examRepository`),
        questions: require(`../../../src/repositories/${driver}/questionRepository`),
        submissions: require(`../../../src/repositories/${driver}/submissionRepository`),
      };
      for (const [name, keys] of Object.entries(expectedKeys)) {
        for (const key of keys) {
          expect(typeof mods[name][key]).toBe('function');
        }
      }
    }
  });
});
