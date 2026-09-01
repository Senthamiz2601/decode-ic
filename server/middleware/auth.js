const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    req.userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    });
  }
}

module.exports = requireAuth;