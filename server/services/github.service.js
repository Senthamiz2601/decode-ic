// ─────────────────────────────────────────────
// GitHub service
//
// The only module that talks directly to the GitHub API. Everything
// else (controllers, the repository analyzer) goes through this
// service instead of calling fetch() against GITHUB_API directly.
// ─────────────────────────────────────────────

const { GITHUB_API, getGitHubHeaders } = require('../config/github');
const logger = require('../utils/logger');

// A small typed error so controllers can map GitHub failures to a
// sensible HTTP status without parsing strings.
class GitHubApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status || 502;
  }
}

// GET /users/:owner/repos
async function fetchRepositoriesForOwner(owner) {
  const response = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(owner)}/repos?per_page=30&sort=updated`,
    { headers: getGitHubHeaders() }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('GitHub repositories API error:', response.status, errorText);
    throw new GitHubApiError(
      'GitHub user not found or repositories are inaccessible',
      response.status
    );
  }

  const data = await response.json();

  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    description: repo.description,
    language: repo.language,
    defaultBranch: repo.default_branch,
    stars: repo.stargazers_count,
    private: repo.private,
  }));
}

// GET /repos/:owner/:repo
async function fetchRepositoryMetadata(owner, repo) {
  const response = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers: getGitHubHeaders() }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('GitHub repository API error:', response.status, errorText);
    throw new GitHubApiError(
      'GitHub repository not found or inaccessible',
      response.status
    );
  }

  return response.json();
}

// GET /repos/:owner/:repo/git/trees/:branch?recursive=1
async function fetchRepositoryTree(owner, repo, branch) {
  const response = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: getGitHubHeaders() }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('GitHub tree API error:', response.status, errorText);
    throw new GitHubApiError('Unable to read repository files from GitHub', response.status);
  }

  return response.json();
}

// GET /repos/:owner/:repo/git/blobs/:sha
async function fetchBlobContent(owner, repo, sha) {
  const response = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/git/blobs/${sha}`,
    { headers: getGitHubHeaders() }
  );

  if (!response.ok) {
    return null;
  }

  const blob = await response.json();

  if (blob.encoding !== 'base64') {
    return null;
  }

  return Buffer.from(blob.content, 'base64').toString('utf8');
}

module.exports = {
  GitHubApiError,
  fetchRepositoriesForOwner,
  fetchRepositoryMetadata,
  fetchRepositoryTree,
  fetchBlobContent,
};

