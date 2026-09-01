const { createFinding } = require('../utils/findings');

// Logic unchanged from the original server.js analyzeRepositoryData().
function largeCodebaseRule({ linesOfCode }) {
  const findings = [];

  if (linesOfCode > 50000) {
    findings.push(
      createFinding({
        category: 'Maintainability',
        severity: 'medium',
        title: 'Large codebase',
        description: `The analyzed repository contains approximately ${linesOfCode.toLocaleString()} lines of code.`,
      })
    );
  }

  return findings;
}

module.exports = largeCodebaseRule;
