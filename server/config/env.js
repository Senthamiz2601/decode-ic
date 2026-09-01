// ─────────────────────────────────────────────
// Environment configuration
// ─────────────────────────────────────────────

require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,

  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',

  MONGODB_URI: (process.env.MONGODB_URI || '')
  .replace(/^MONGODB_URI=/, '')
  .trim(),

  JWT_SECRET: process.env.JWT_SECRET || '',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  NODE_ENV: process.env.NODE_ENV || 'development',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || '1mb',
};

module.exports = env;