// ─────────────────────────────────────────────
// Health / risk / technical-debt calculations
//
// Extracted verbatim from server.js. Logic is unchanged from the
// original implementation on purpose (per refactor instructions) —
// these numbers must keep matching what the frontend already shows.
// ─────────────────────────────────────────────

function calculatePercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function calculateRiskLevel(findings) {
  const critical = findings.filter((finding) => finding.severity === 'critical').length;
  const high = findings.filter((finding) => finding.severity === 'high').length;
  const medium = findings.filter((finding) => finding.severity === 'medium').length;

  if (critical > 0 || high >= 5) {
    return 'high';
  }

  if (high > 0 || medium >= 5) {
    return 'medium';
  }

  return 'low';
}

function calculateHealthScore({ fileCount, linesOfCode, dependencyCount, findings }) {
  if (fileCount === 0) {
    return 0;
  }

  let score = 100;

  // Repository size
  if (linesOfCode > 100000) {
    score -= 15;
  } else if (linesOfCode > 50000) {
    score -= 10;
  } else if (linesOfCode > 20000) {
    score -= 5;
  }

  // Dependency volume
  if (dependencyCount > 200) {
    score -= 10;
  } else if (dependencyCount > 100) {
    score -= 5;
  }

  // Findings
  const critical = findings.filter((finding) => finding.severity === 'critical').length;
  const high = findings.filter((finding) => finding.severity === 'high').length;
  const medium = findings.filter((finding) => finding.severity === 'medium').length;
  const low = findings.filter((finding) => finding.severity === 'low').length;

  score -= critical * 15;
  score -= high * 7;
  score -= medium * 3;
  score -= low * 1;

  return Math.max(0, Math.min(100, score));
}

function calculateTechnicalDebt({ linesOfCode, findings }) {
  if (linesOfCode === 0) {
    return 0;
  }

  let debtPoints = 0;

  const weights = {
    critical: 8,
    high: 5,
    medium: 2,
    low: 1,
  };

  for (const finding of findings) {
    debtPoints += weights[finding.severity] || 1;
  }

  const sizeAdjustment = linesOfCode > 50000 ? 4 : linesOfCode > 20000 ? 2 : 0;

  const rawDebt = debtPoints + sizeAdjustment;

  // Keep the UI value interpretable as a percentage.
  return Math.min(
    50,
    Math.round((rawDebt / Math.max(10, linesOfCode / 1000)) * 10)
  );
}

module.exports = {
  calculatePercent,
  calculateRiskLevel,
  calculateHealthScore,
  calculateTechnicalDebt,
};
