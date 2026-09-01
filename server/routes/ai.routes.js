const express = require('express');

const {
  askRepositoryAI,
  getRepositoryAISuggestions,
} = require('../controllers/ai.controller');

const router = express.Router();

router.post(
  '/repositories/:id/ai/query',
  askRepositoryAI
);

router.get(
  '/repositories/:id/ai/suggestions',
  getRepositoryAISuggestions
);

module.exports = router;