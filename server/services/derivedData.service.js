// ─────────────────────────────────────────────
// Derived views
//
// Pure transforms of the real `repository.analysis` object (produced
// by analyzeRepositoryData()) into the shapes the Dependencies, Risk
// Center, Technical Debt, and Reports pages expect. No new analysis
// is performed here and no values are invented — every field below
// traces back to something the analyzer already computed. Where the
// analyzer does not compute a value the mock UI used to show (e.g.
// package license/outdated/circular status, a fixed debt-category
// taxonomy), that field is simply omitted or reported as
// unavailable rather than faked.
// ─────────────────────────────────────────────

const SEVERITY_SCORE = { critical: 95, high: 75, medium: 50, low: 25 };

const CATEGORY_RECOMMENDATIONS = {
  Security: 'Review and remediate this security finding before shipping.',
  Complexity: 'Consider simplifying this code path to reduce nesting/complexity.',
  Architecture: 'Review the API surface for opportunities to consolidate or modularize.',
  Maintainability: 'Break this up or add tests to make future changes safer.',
  Dependencies: 'Audit dependencies for ones that can be trimmed or consolidated.',
  'Technical Debt': 'Resolve this outstanding TODO/FIXME as part of a cleanup pass.',
};

function ensureAnalysis(repository) {
  return repository && repository.analysis ? repository.analysis : null;
}

// ── Dependencies ──────────────────────────────
function buildDependenciesView(repository) {
  const analysis = ensureAnalysis(repository);

  if (!analysis) {
    return { available: false, dependencyCount: 0, manifests: [] };
  }

  return {
    available: true,
    dependencyCount: analysis.dependencyCount || 0,
    manifests: (analysis.dependencyDetails || []).map((manifest) => ({
      manifest: manifest.manifest,
      ecosystem: manifest.ecosystem,
      count: manifest.count,
      dependencies: (manifest.details && manifest.details.length
        ? manifest.details
        : manifest.dependencies.map((name) => ({ name }))
      ).map((dependency) => ({
        name: dependency.name,
        version: dependency.version || null,
        type: dependency.type || null,
        ecosystem: dependency.ecosystem || manifest.ecosystem,
        sourceFile: dependency.sourceFile || manifest.manifest,
      })),
    })),
  };
}

// ── Risk Center ────────────────────────────────
function buildRisksView(repository) {
  const analysis = ensureAnalysis(repository);

  if (!analysis) {
    return { available: false, riskLevel: 'low', risks: [] };
  }

  const findings = analysis.findings || [];

  const risks = findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    module: finding.category,
    level: finding.severity,
    score: SEVERITY_SCORE[finding.severity] || 25,
    reasons: [finding.description].filter(Boolean),
    affectedFiles: [finding.file].filter(Boolean),
    recommendation:
      CATEGORY_RECOMMENDATIONS[finding.category] ||
      'Review this finding and address it as appropriate.',
  }));

  return {
    available: true,
    riskLevel: analysis.riskLevel,
    risks,
  };
}

// ── Technical Debt ─────────────────────────────
function buildTechnicalDebtView(repository) {
  const analysis = ensureAnalysis(repository);

  if (!analysis) {
    return { available: false, technicalDebtPercent: 0, byCategory: [], issues: [] };
  }

  const findings = analysis.findings || [];

  const byCategoryMap = new Map();
  for (const finding of findings) {
    byCategoryMap.set(finding.category, (byCategoryMap.get(finding.category) || 0) + 1);
  }

  const issues = findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    file: finding.file,
    line: finding.line,
    description: finding.description,
  }));

  return {
    available: true,
    technicalDebtPercent: analysis.technicalDebtPercent || 0,
    byCategory: Array.from(byCategoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
    issues,
  };
}

// ── Reports ─────────────────────────────────────
function buildReportsView(repository) {
  const analysis = ensureAnalysis(repository);

  if (!analysis) {
    return { available: false, reports: [] };
  }

  const generatedAt = analysis.analyzedAt;
  const findings = analysis.findings || [];

  const reports = [
    {
      id: 'health',
      title: 'Code Health Report',
      type: 'health',
      generatedAt,
      summary: `Overall health score is ${analysis.healthScore}/100 across ${analysis.fileCount} analyzed files (${analysis.linesOfCode} lines of code).`,
    },
    {
      id: 'architecture',
      title: 'Architecture Report',
      type: 'architecture',
      generatedAt,
      summary: `${analysis.componentCount} components and ${analysis.apiEndpointCount} API endpoints detected across the analyzed repository structure.`,
    },
    {
      id: 'risk',
      title: 'Risk Assessment Report',
      type: 'risk',
      generatedAt,
      summary: `Overall risk level is ${analysis.riskLevel}, based on ${findings.length} detected finding(s).`,
    },
    {
      id: 'technical-debt',
      title: 'Technical Debt Report',
      type: 'technical-debt',
      generatedAt,
      summary: `${analysis.technicalDebtPercent}% technical debt estimate from ${findings.length} finding(s) across the codebase.`,
    },
    {
      id: 'dependencies',
      title: 'Dependency Report',
      type: 'dependencies',
      generatedAt,
      summary: `${analysis.dependencyCount} dependencies detected across ${(analysis.dependencyDetails || []).length} manifest file(s).`,
    },
  ];

  return { available: true, reports };
}

module.exports = {
  buildDependenciesView,
  buildRisksView,
  buildTechnicalDebtView,
  buildReportsView,
};
