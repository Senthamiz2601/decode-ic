const { createFinding, getLineNumber } = require('../utils/findings');

const SECRET_PATTERN =
  /\b(api[-_]?key|secret|password|token|access[-_]?token)\b\s*[:=]\s*['"][^'"]{8,}['"]/gi;

// Flags values that look like hardcoded credentials/secrets.
// Logic unchanged from the original server.js detectCodeFindings().
function hardcodedSecretRule(content, filePath) {
  const findings = [];

  for (const match of content.matchAll(SECRET_PATTERN)) {
    findings.push(
      createFinding({
        category: 'Security',
        severity: 'high',
        title: 'Possible hardcoded secret',
        description:
          'A value resembling a credential or secret appears to be hardcoded in source code.',
        file: filePath,
        line: getLineNumber(content, match.index),
      })
    );
  }

  return findings;
}

module.exports = hardcodedSecretRule;
