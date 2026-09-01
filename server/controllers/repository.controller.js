const githubService = require('../services/github.service');
const { GitHubApiError } = require('../services/github.service');
const repositoryService = require('../services/repository.service');
const { analyzeRepositoryData } = require('../services/analyzer/repositoryAnalyzer.service');
const {
  buildDependenciesView,
  buildRisksView,
  buildTechnicalDebtView,
  buildReportsView,
} = require('../services/derivedData.service');
const logger = require('../utils/logger');
const {
  isValidGitHubOwner,
  isValidGitHubRepoName,
  isValidRepositoryId,
  normalizeExcludedFolders,
} = require('../utils/validation');

// POST /api/repositories/connect
async function connectRepository(req, res) {
  const { owner, repo } = req.body || {};

  if (!isValidGitHubOwner(owner) || !isValidGitHubRepoName(repo)) {
    return res.status(400).json({
      ok: false,
      message: 'GitHub owner and repository name are required',
    });
  }

  try {
    const data = await githubService.fetchRepositoryMetadata(owner, repo);
    const repository = repositoryService.upsertRepositoryFromGitHubData(data);

    logger.info(`Repository connected: ${repository.fullName}`);

    res.json({ ok: true, repository });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }

    logger.error('Repository connection error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to connect to GitHub repository',
    });
  }
}

// GET /api/repositories
function listRepositories(req, res) {
  res.json({
    ok: true,
    repositories: repositoryService.listRepositories(),
  });
}

// GET /api/repositories/:id
function getRepository(req, res) {
  try {
    const repository = repositoryService.findRepositoryById(req.params.id);

    if (!repository) {
      return res.status(404).json({ ok: false, message: 'Repository not found' });
    }

    res.json({ ok: true, repository });
  } catch (error) {
    logger.error('Repository overview error:', error);

    res.status(500).json({ ok: false, message: 'Failed to load repository' });
  }
}

// Shared implementation for analyze + re-analyze, which only differ
// in status codes/messages on the "not connected" path and in what
// branch they fall back to. Kept as one function so the analysis
// flow (and its error handling) can't drift between the two routes.
async function runAnalysis(req, res, { notConnectedStatus, notConnectedMessage, successMessage, failureMessage, logLabel, resolveBranch }) {
  const { id } = req.params;

  if (!isValidRepositoryId(id)) {
    return res.status(400).json({ ok: false, message: 'Repository id is required' });
  }

  const repository = repositoryService.findRepositoryById(id);

  if (!repository) {
    return res.status(notConnectedStatus).json({ ok: false, message: notConnectedMessage });
  }

  const selectedBranch = resolveBranch(req, repository);
  const excluded = normalizeExcludedFolders(req.body?.excludedFolders);

  logger.info(`${logLabel}: ${repository.fullName || `${repository.owner}/${repository.name}`}@${selectedBranch}`);

  repository.status = 'analyzing';

  try {
    const analysis = await analyzeRepositoryData({
      repository,
      branch: selectedBranch,
      excludedFolders: excluded,
    });

    repositoryService.applyAnalysisResult(repository, analysis, selectedBranch);

    logger.info(`${logLabel} completed: ${repository.fullName}`);

    res.json({ ok: true, message: successMessage, repository, analysis });
  } catch (error) {
    logger.error(`${logLabel} error:`, error);

    repository.status = 'connected';

    res.status(500).json({
      ok: false,
      message: error.message || failureMessage,
    });
  }
}

// POST /api/repositories/:id/analyze
async function analyzeRepository(req, res) {
  await runAnalysis(req, res, {
    notConnectedStatus: 404,
    notConnectedMessage: 'Repository is not connected',
    successMessage: 'Repository analysis completed',
    failureMessage: 'Failed to analyze repository',
    logLabel: 'Starting analysis',
    // Original /analyze behavior: an explicit branch in the request
    // wins, otherwise fall back straight to the repository's default
    // branch (does NOT consult a previously stored repository.branch).
    resolveBranch: (req, repository) => req.body?.branch || repository.defaultBranch,
  });
}

// POST /api/repositories/:id/re-analyze
async function reanalyzeRepository(req, res) {
  await runAnalysis(req, res, {
    notConnectedStatus: 404,
    notConnectedMessage: 'Repository not found',
    successMessage: 'Repository re-analysis completed',
    failureMessage: 'Failed to re-analyze repository',
    logLabel: 'Starting re-analysis',
    // Original /re-analyze behavior: explicit branch, then the
    // previously stored branch, then the repository's default branch.
    resolveBranch: (req, repository) =>
      req.body?.branch || repository.branch || repository.defaultBranch,
  });
}

// DELETE /api/repositories/:id
function deleteRepository(req, res) {
  const deleted = repositoryService.deleteRepositoryById(req.params.id);

  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'Repository not found' });
  }

  res.json({ ok: true, message: 'Repository removed' });
}

// Shared guard for the derived-data endpoints below: validates the
// id, loads the repository, and returns a clear 404 whether the
// repository itself or its analysis is missing — mirroring the
// existing getRepositoryArchitecture behavior so all analysis-backed
// endpoints fail the same way.
function loadRepositoryOr404(req, res, { requireAnalysis = true } = {}) {
  const { id } = req.params;

  if (!isValidRepositoryId(id)) {
    res.status(400).json({ ok: false, message: 'Repository id is required' });
    return null;
  }

  const repository = repositoryService.findRepositoryById(id);

  if (!repository) {
    res.status(404).json({ ok: false, message: 'Repository not found' });
    return null;
  }

  if (requireAnalysis && !repository.analysis) {
    res.status(404).json({
      ok: false,
      message: 'Repository analysis is not available. Please analyze the repository first.',
    });
    return null;
  }

  return repository;
}

// GET /api/repositories/:id/dependencies
function getRepositoryDependencies(req, res) {
  try {
    const repository = loadRepositoryOr404(req, res);
    if (!repository) return;

    res.json({ ok: true, ...buildDependenciesView(repository) });
  } catch (error) {
    logger.error('Repository dependencies error:', error);
    res.status(500).json({ ok: false, message: 'Failed to load dependencies' });
  }
}

// GET /api/repositories/:id/risks
function getRepositoryRisks(req, res) {
  try {
    const repository = loadRepositoryOr404(req, res);
    if (!repository) return;

    res.json({ ok: true, ...buildRisksView(repository) });
  } catch (error) {
    logger.error('Repository risks error:', error);
    res.status(500).json({ ok: false, message: 'Failed to load risks' });
  }
}

// GET /api/repositories/:id/technical-debt
function getRepositoryTechnicalDebt(req, res) {
  try {
    const repository = loadRepositoryOr404(req, res);
    if (!repository) return;

    res.json({ ok: true, ...buildTechnicalDebtView(repository) });
  } catch (error) {
    logger.error('Repository technical debt error:', error);
    res.status(500).json({ ok: false, message: 'Failed to load technical debt' });
  }
}

// GET /api/repositories/:id/reports
function getRepositoryReports(req, res) {
  try {
    const repository = loadRepositoryOr404(req, res);
    if (!repository) return;

    res.json({ ok: true, ...buildReportsView(repository) });
  } catch (error) {
    logger.error('Repository reports error:', error);
    res.status(500).json({ ok: false, message: 'Failed to load reports' });
  }
}

function getRepositoryArchitecture(req, res) {
  try {
    const repository = repositoryService.findRepositoryById(req.params.id);

    if (!repository) {
      return res.status(404).json({
        ok: false,
        message: 'Repository not found',
      });
    }

    const architecture = repository.analysis?.architecture;

    if (!architecture) {
      return res.status(404).json({
        ok: false,
        message:
          'Architecture analysis is not available. Please analyze the repository first.',
      });
    }

    res.json({
      ok: true,
      architecture,
    });
  } catch (error) {
    logger.error('Repository architecture error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to load repository architecture',
    });
  }
}

// GET /api/repositories/:id/files
// Small backend addition for Code Explorer: the analyzer only persists
// aggregated stats (see repositoryAnalyzer.service.js), not the raw file
// list, so there's nothing to read from the stored repository record.
// This re-reads the real GitHub tree for the repository's analyzed
// branch (same call the analyzer itself makes) and returns it as a
// nested tree. No file data is invented.
async function getRepositoryFileTree(req, res) {
  try {
    const repository = repositoryService.findRepositoryById(req.params.id);

    if (!repository) {
      return res.status(404).json({ ok: false, message: 'Repository not found' });
    }

    if (!repository.analysis) {
      return res.status(404).json({
        ok: false,
        message: 'Repository has not been analyzed yet. Please analyze it first.',
      });
    }

    const branch = repository.branch || repository.defaultBranch;
    const treeData = await githubService.fetchRepositoryTree(repository.owner, repository.name, branch);

    const { isBinaryFile } = require('../analyzers/fileAnalyzer');

    const files = (treeData.tree || [])
      .filter((item) => item.type === 'blob' && item.path && !isBinaryFile(item.path))
      .map((item) => ({ path: item.path, sha: item.sha, size: item.size }));

    res.json({ ok: true, files, truncated: treeData.truncated === true });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }

    logger.error('Repository file tree error:', error);

    res.status(500).json({ ok: false, message: 'Failed to load repository files' });
  }
}

// GET /api/repositories/:id/files/content?path=...
// Fetches the real file content for a single file from GitHub, using
// the same blob API the analyzer uses. No content is invented; if the
// file can't be found or read, that is reported back as an error.
async function getRepositoryFileContent(req, res) {
  try {
    const repository = repositoryService.findRepositoryById(req.params.id);

    if (!repository) {
      return res.status(404).json({ ok: false, message: 'Repository not found' });
    }

    const filePath = req.query.path;

    if (!filePath) {
      return res.status(400).json({ ok: false, message: 'A file path is required' });
    }

    const branch = repository.branch || repository.defaultBranch;
    const treeData = await githubService.fetchRepositoryTree(repository.owner, repository.name, branch);
    const file = (treeData.tree || []).find((item) => item.type === 'blob' && item.path === filePath);

    if (!file) {
      return res.status(404).json({ ok: false, message: 'File not found in repository' });
    }

    const content = await githubService.fetchBlobContent(repository.owner, repository.name, file.sha);

    if (content === null) {
      return res.status(422).json({ ok: false, message: 'File could not be read (likely binary or too large)' });
    }

    const { getLanguageFromFile, countCodeLines } = require('../analyzers/fileAnalyzer');

    res.json({
      ok: true,
      path: filePath,
      content,
      language: getLanguageFromFile(filePath),
      lineCount: countCodeLines(content),
      size: file.size,
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }

    logger.error('Repository file content error:', error);

    res.status(500).json({ ok: false, message: 'Failed to load file content' });
  }
}

module.exports = {
  connectRepository,
  listRepositories,
  getRepository,
  getRepositoryArchitecture,
  getRepositoryDependencies,
  getRepositoryRisks,
  getRepositoryTechnicalDebt,
  getRepositoryReports,
  getRepositoryFileTree,
  getRepositoryFileContent,
  analyzeRepository,
  reanalyzeRepository,
  deleteRepository,
};
