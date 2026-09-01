const githubService = require('../services/github.service');
const { GitHubApiError } = require('../services/github.service');
const { isValidGitHubOwner } = require('../utils/validation');
const logger = require('../utils/logger');

// GET /api/github/repositories/:owner
async function getRepositoriesForOwner(req, res) {
  const { owner } = req.params;

  if (!isValidGitHubOwner(owner)) {
    return res.status(400).json({
      ok: false,
      message: 'GitHub owner is required',
    });
  }

  try {
    const repositories = await githubService.fetchRepositoriesForOwner(owner);

    res.json({ ok: true, repositories });
  } catch (error) {
    // Preserves the original response shape: GitHub's own status
    // (404, 403, etc.) is forwarded with a clean, non-leaking message;
    // anything unexpected (network errors, etc.) becomes a 500.
    if (error instanceof GitHubApiError) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }

    logger.error('GitHub repositories error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to fetch GitHub repositories',
    });
  }
}

module.exports = { getRepositoriesForOwner };
