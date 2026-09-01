const { createFinding } = require('../utils/findings');

// Logic unchanged from the original server.js analyzeRepositoryData().
function largeApiSurfaceRule({ apiEndpointCount }) {
  const findings = [];

  if (apiEndpointCount > 50) {
    findings.push(
      createFinding({
        category: 'Architecture',
        severity: 'medium',
        title: 'Large API surface',
        description: `The analyzer detected ${apiEndpointCount} API endpoints. A large API surface should be reviewed for consistency and maintainability.`,
      })
    );
  }

  return findings;
}

module.exports = largeApiSurfaceRule;
