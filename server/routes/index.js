const express = require('express');

const githubRoutes = require('./github.routes');
const healthRoutes = require('./health.routes');
const repositoryRoutes = require('./repository.routes');
const authRoutes = require('./auth.routes');
const aiRoutes = require('./ai.routes');

const router = express.Router();

router.use(healthRoutes);
router.use(githubRoutes);
router.use(repositoryRoutes);
router.use(aiRoutes);
router.use('/auth', authRoutes);

module.exports = router;