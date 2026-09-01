// Catches any request that didn't match a route. The original
// server.js had no explicit 404 handler (Express's default HTML 404
// page would have been served); this returns a clean JSON 404
// instead, which is friendlier for an API consumed by the frontend.
function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFoundHandler;
