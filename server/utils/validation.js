// ─────────────────────────────────────────────
// Lightweight validation helpers
//
// Deliberately simple (per refactor instructions: "do not
// over-engineer validation"). These just centralize checks that
// used to be inline `if (!x) return res.status(400)...` blocks in
// server.js, so controllers stay thin and consistent.
// ─────────────────────────────────────────────

// GitHub owner/repo names: letters, numbers, hyphens, underscores, dots.
const GITHUB_NAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,99})$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidGitHubOwner(owner) {
  return isNonEmptyString(owner) && GITHUB_NAME_PATTERN.test(owner.trim());
}

function isValidGitHubRepoName(repo) {
  return isNonEmptyString(repo) && GITHUB_NAME_PATTERN.test(repo.trim());
}

function isValidRepositoryId(id) {
  return isNonEmptyString(id);
}

function isValidBranchName(branch) {
  if (branch === undefined || branch === null || branch === '') {
    // Branch is optional — callers fall back to the repository's
    // default branch, matching the original behavior.
    return true;
  }

  return isNonEmptyString(branch) && !branch.includes('..');
}

// Normalizes the `excludedFolders` request field, which historically
// arrives either as an array or as a comma-separated string.
function normalizeExcludedFolders(excludedFolders) {
  if (Array.isArray(excludedFolders)) {
    return excludedFolders.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(excludedFolders || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  isNonEmptyString,
  isValidGitHubOwner,
  isValidGitHubRepoName,
  isValidRepositoryId,
  isValidBranchName,
  normalizeExcludedFolders,
};
