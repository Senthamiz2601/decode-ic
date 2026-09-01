// ─────────────────────────────────────────────
// Centralized logger
//
// Replaces the scattered console.log/console.error calls that were
// previously inline in server.js. Behavior is the same (writes to
// stdout/stderr) but now goes through one place so verbosity can be
// controlled with LOG_LEVEL, and so future work (structured logs,
// shipping logs somewhere) only touches this file.
//
// LOG_LEVEL=debug  -> info, warn, error, debug all print
// LOG_LEVEL=info   -> info, warn, error print (default)
// LOG_LEVEL=warn   -> warn, error print
// LOG_LEVEL=silent -> nothing prints
// ─────────────────────────────────────────────

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const configuredLevel =
  LEVELS[String(process.env.LOG_LEVEL || 'info').toLowerCase()] ??
  LEVELS.info;

function shouldLog(level) {
  return LEVELS[level] >= configuredLevel;
}

const logger = {
  debug(...args) {
    if (shouldLog('debug')) {
      console.log('[debug]', ...args);
    }
  },
  info(...args) {
    if (shouldLog('info')) {
      console.log(...args);
    }
  },
  warn(...args) {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  error(...args) {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
};

module.exports = logger;
