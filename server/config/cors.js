// ─────────────────────────────────────────────
// CORS configuration
//
// The original server.js used `app.use(cors())`, i.e. reflect any
// origin. That default is preserved when CORS_ORIGINS is unset so
// behavior doesn't change; setting CORS_ORIGINS in the environment
// (comma-separated) lets it be locked down later without touching
// code.
// ─────────────────────────────────────────────

const env = require('./env');

function buildCorsOptions() {
  if (env.CORS_ORIGINS.length === 0) {
    return {}; // cors() with no options reflects any origin — original behavior.
  }

  return {
    origin: env.CORS_ORIGINS,
  };
}

module.exports = { buildCorsOptions };
