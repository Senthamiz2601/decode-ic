const { createFinding } = require('../utils/findings');

// Logic unchanged from the original server.js analyzeRepositoryData().
function largeDependencyCountRule({ dependencyCount }) {
  const findings = [];

  if (dependencyCount > 100) {
    findings.push(
      createFinding({
        category: 'Dependencies',
        severity: dependencyCount > 200 ? 'high' : 'medium',
        title: 'High dependency count',
        description: `The repository contains ${dependencyCount} detected dependencies across its supported manifests.`,
      })
    );
  }

  return findings;
}

module.exports = largeDependencyCountRule;
