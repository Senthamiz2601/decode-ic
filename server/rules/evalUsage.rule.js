const { createFinding, getLineNumber } = require('../utils/findings');

const EVAL_PATTERN = /\beval\s*\(/g;

// Flags dynamic eval() usage.
// Logic unchanged from the original server.js detectCodeFindings().
function evalUsageRule(content, filePath) {
  const findings = [];

  for (const match of content.matchAll(EVAL_PATTERN)) {
    findings.push(
      createFinding({
        category: 'Security',
        severity: 'high',
        title: 'Dynamic eval usage',
        description:
          'Use of eval can execute dynamically supplied code and should be reviewed carefully.',
        file: filePath,
        line: getLineNumber(content, match.index),
      })
    );
  }

  return findings;
}

module.exports = evalUsageRule;
