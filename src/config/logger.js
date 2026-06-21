'use strict';

const env = require('./env');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.isTest ? -1 : (levels[process.env.LOG_LEVEL] ?? levels.info);

const fmt = (level, args) => {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  return [prefix, ...args];
};

const logger = {
  error: (...args) => currentLevel >= levels.error && console.error(...fmt('error', args)),
  warn: (...args) => currentLevel >= levels.warn && console.warn(...fmt('warn', args)),
  info: (...args) => currentLevel >= levels.info && console.log(...fmt('info', args)),
  debug: (...args) => currentLevel >= levels.debug && console.log(...fmt('debug', args)),
};

module.exports = logger;
