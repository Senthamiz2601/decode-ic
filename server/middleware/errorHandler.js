// ─────────────────────────────────────────────
// Centralized error handler
//
// Safety net for anything that isn't already caught inside a
// controller (all existing routes catch their own errors to
// preserve their original response shapes/messages — see the
// controllers). This exists so that any *new* route added later,
// or an unexpected synchronous throw, still returns a clean JSON
// error instead of leaking a stack trace or internal details.
// ─────────────────────────────────────────────

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error:', err);

  const status = err.status || 500;

  // Stack traces and raw error details are logged server-side only
  // (see above) and never included in the HTTP response.
  res.status(status).json({
    ok: false,
    message: status === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
