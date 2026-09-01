const repositoryService = require('../services/repository.service');
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const { isValidRepositoryId } = require('../utils/validation');

// POST /api/repositories/:id/ai/query
async function askRepositoryAI(req, res) {
  const { id } = req.params;
  const { question } = req.body || {};

  if (!isValidRepositoryId(id)) {
    return res.status(400).json({
      ok: false,
      message: 'Repository id is required',
    });
  }

  if (!question || !String(question).trim()) {
    return res.status(400).json({
      ok: false,
      message: 'A question is required',
    });
  }

  try {
    const repository = repositoryService.findRepositoryById(id);

    if (!repository) {
      return res.status(404).json({
        ok: false,
        message: 'Repository not found',
      });
    }

    if (!repository.analysis) {
      return res.status(404).json({
        ok: false,
        message:
          'Repository analysis is not available. Please analyze the repository first.',
      });
    }

    const result = aiService.answerQuestion(question, repository);

    return res.json({
      ok: true,
      answer: {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        relatedFiles: result.relatedFiles || [],
      },
    });
  } catch (error) {
    logger.error('AI query error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to process repository question',
    });
  }
}

// GET /api/repositories/:id/ai/suggestions
function getRepositoryAISuggestions(req, res) {
  const { id } = req.params;

  if (!isValidRepositoryId(id)) {
    return res.status(400).json({
      ok: false,
      message: 'Repository id is required',
    });
  }

  try {
    const repository = repositoryService.findRepositoryById(id);

    if (!repository) {
      return res.status(404).json({
        ok: false,
        message: 'Repository not found',
      });
    }

    if (!repository.analysis) {
      return res.status(404).json({
        ok: false,
        message:
          'Repository analysis is not available. Please analyze the repository first.',
      });
    }

    return res.json({
      ok: true,
      questions: aiService.getSuggestedQuestions(repository),
    });
  } catch (error) {
    logger.error('AI suggestions error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to generate AI suggestions',
    });
  }
}

module.exports = {
  askRepositoryAI,
  getRepositoryAISuggestions,
};