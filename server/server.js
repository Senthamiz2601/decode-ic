// ─────────────────────────────────────────────
// Decode.IC backend — application entry point
//
// This file intentionally stays small. It only:
//   - loads environment configuration
//   - creates the Express app
//   - configures middleware (CORS, JSON body parsing)
//   - mounts routes
//   - configures error handling
//   - starts the server
//
// All repository-analysis logic lives in /analyzers, /rules,
// /services, and /controllers — see server/README.md (if present)
// or the refactor notes for the full module map.
// ─────────────────────────────────────────────

const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { buildCorsOptions } = require('./config/cors');
const logger = require('./utils/logger');

const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFound');
const connectDatabase = require('./config/db');

logger.info('GitHub token loaded:', !!env.GITHUB_TOKEN);

const app = express();

app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Decode.IC backend running on port ${env.PORT}`);
  });
}

startServer();

module.exports = app;
