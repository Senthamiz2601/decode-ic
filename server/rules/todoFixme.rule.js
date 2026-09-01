const { createFinding } = require('../utils/findings');

// Flags unresolved TODO/FIXME markers.
// Logic unchanged from the original server.js detectCodeFindings().
function todoFixmeRule(content, filePath, lines) {
  const findings = [];

  lines.forEach((line, index) => {
    if (/\b(FIXME|TODO)\b/i.test(line)) {
      findings.push(
        createFinding({
          category: 'Technical Debt',
          severity: 'low',
          title: 'Unresolved TODO/FIXME',
          description: 'The source contains an unresolved TODO or FIXME marker.',
          file: filePath,
          line: index + 1,
        })
      );
    }
  });

  return findings;
}

module.exports = todoFixmeRule;
