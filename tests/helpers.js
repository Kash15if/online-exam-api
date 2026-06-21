'use strict';

const repositories = require('../src/repositories');

const resetAll = async () => {
  // Reset is mainly used in tests with the in-memory driver. Real DB drivers
  // also implement reset() (it TRUNCATEs), but tests should run against memory.
  await repositories.users.reset();
  await repositories.exams.reset();
  await repositories.questions.reset();
  await repositories.submissions.reset();
};

module.exports = { resetAll };
