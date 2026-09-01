// ─────────────────────────────────────────────
// Repository service
//
// Owns the connected-repository state. Currently in-memory, matching
// the original server.js behavior exactly (no persistent storage was
// implemented before, so none is introduced now). If persistent
// storage is added later, only this file needs to change — everything
// else already goes through this service's functions.
// ─────────────────────────────────────────────

// Temporary in-memory repository storage.
const connectedRepositories = [];

function listRepositories() {
  return connectedRepositories;
}

function findRepositoryById(id) {
  if (!id) {
    return null;
  }

  const normalizedId = String(id);

  return (
    connectedRepositories.find((item) => String(item.id) === normalizedId) ||
    connectedRepositories.find((item) => `${item.owner}-${item.name}` === normalizedId) ||
    null
  );
}

// Builds the connected-repository record from raw GitHub metadata
// and upserts it into the in-memory store. Logic unchanged from the
// original server.js POST /api/repositories/connect handler.
function upsertRepositoryFromGitHubData(data) {
  const repository = {
    id: String(data.id),
    githubId: data.id,

    name: data.name,
    fullName: data.full_name,
    owner: data.owner.login,

    description: data.description,
    language: data.language,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
    private: data.private,

    fileCount: 0,
    linesOfCode: 0,
    dependencyCount: 0,
    componentCount: 0,
    apiEndpointCount: 0,

    healthScore: 0,
    technicalDebtPercent: 0,
    riskLevel: 'low',

    lastAnalyzed: 'Not analyzed',
    status: 'connected',
    branch: data.default_branch,
    languages: [],
    analysis: null,
  };

  const existingIndex = connectedRepositories.findIndex((item) => item.id === repository.id);

  if (existingIndex >= 0) {
    connectedRepositories[existingIndex] = repository;
  } else {
    connectedRepositories.push(repository);
  }

  return repository;
}

// Applies a completed analysis result onto a connected repository
// record. Logic unchanged from the original server.js analyze /
// re-analyze handlers.
function applyAnalysisResult(repository, analysis, branch) {
  repository.fileCount = analysis.fileCount;
  repository.linesOfCode = analysis.linesOfCode;
  repository.dependencyCount = analysis.dependencyCount;
  repository.componentCount = analysis.componentCount;
  repository.apiEndpointCount = analysis.apiEndpointCount;
  repository.healthScore = analysis.healthScore;
  repository.technicalDebtPercent = analysis.technicalDebtPercent;
  repository.riskLevel = analysis.riskLevel;
  repository.lastAnalyzed = new Date().toLocaleString();
  repository.status = 'complete';
  repository.branch = branch;
  repository.languages = analysis.languages;
  repository.analysis = analysis;

  return repository;
}

function deleteRepositoryById(id) {
  const index = connectedRepositories.findIndex(
    (item) => String(item.id) === String(id) || `${item.owner}-${item.name}` === id
  );

  if (index === -1) {
    return false;
  }

  connectedRepositories.splice(index, 1);
  return true;
}

module.exports = {
  listRepositories,
  findRepositoryById,
  upsertRepositoryFromGitHubData,
  applyAnalysisResult,
  deleteRepositoryById,
};
