// ─────────────────────────────────────────────
// GitHub API configuration
// ─────────────────────────────────────────────

const env = require('./env');

const GITHUB_API = 'https://api.github.com';

// Returns a fresh headers object per call so nothing downstream can
// mutate a shared object. Never logs env.GITHUB_TOKEN.
function getGitHubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Decode.IC',
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
  };
}

module.exports = {
  GITHUB_API,
  getGitHubHeaders,
};
