'use strict';

const env = require('../config/env');
const logger = require('../config/logger');

const SUPPORTED = ['memory', 'postgres', 'mssql'];

const loadDriver = (driver) => {
  if (!SUPPORTED.includes(driver)) {
    throw new Error(
      `Unsupported REPOSITORY_DRIVER="${driver}". Use one of: ${SUPPORTED.join(', ')}`,
    );
  }

  return {
    users: require(`./${driver}/userRepository`),
    exams: require(`./${driver}/examRepository`),
    questions: require(`./${driver}/questionRepository`),
    submissions: require(`./${driver}/submissionRepository`),
  };
};

const repositories = loadDriver(env.repositoryDriver);

if (!env.isTest) {
  logger.info(`Repository driver: ${env.repositoryDriver}`);
}

module.exports = {
  ...repositories,
  driver: env.repositoryDriver,
};
