const { createFinding } = require('../utils/findings');

// Flags files that are large enough to be hard to maintain.
// Logic unchanged from the original server.js detectCodeFindings().
function largeFileRule(content, filePath, lines) {
  const findings = [];

  if (lines.length > 1000) {
    findings.push(
      createFinding({
        category: 'Maintainability',
        severity: lines.length > 2000 ? 'high' : 'medium',
        title: 'Large source file',
        description: `This file contains ${lines.length} lines and may be difficult to maintain.`,
        file: filePath,
        line: 1,
      })
    );
  }

  return findings;
}

module.exports = largeFileRule;
