// ─────────────────────────────────────────────
// Rules registry
//
// Deterministic, rule-based code findings. To add a new rule:
//   - per-file rule: create rules/myRule.rule.js exporting
//     (content, filePath, lines) => findings[], add it to
//     PER_FILE_RULES below.
//   - repository-level rule: create rules/myRule.rule.js exporting
//     (stats) => findings[], add it to REPOSITORY_LEVEL_RULES below.
//
// This keeps rules deterministic and independently testable instead
// of one large detectCodeFindings() function.
// ─────────────────────────────────────────────

const { isSourceFile } = require('../analyzers/fileAnalyzer');

const largeFileRule = require('./largeFile.rule');
const todoFixmeRule = require('./todoFixme.rule');
const hardcodedSecretRule = require('./hardcodedSecret.rule');
const evalUsageRule = require('./evalUsage.rule');
const deepNestingRule = require('./deepNesting.rule');

const largeDependencyCountRule = require('./largeDependencyCount.rule');
const largeApiSurfaceRule = require('./largeApiSurface.rule');
const largeCodebaseRule = require('./largeCodebase.rule');

const PER_FILE_RULES = [
  largeFileRule,
  todoFixmeRule,
  hardcodedSecretRule,
  evalUsageRule,
  deepNestingRule,
];

const REPOSITORY_LEVEL_RULES = [
  largeDependencyCountRule,
  largeApiSurfaceRule,
  largeCodebaseRule,
];

// Runs all per-file rules against a single file's content.
// Equivalent to the original server.js detectCodeFindings().
function runFileRules(content, filePath) {
  if (!isSourceFile(filePath)) {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const findings = [];

  for (const rule of PER_FILE_RULES) {
    findings.push(...rule(content, filePath, lines));
  }

  return findings;
}

// Runs all repository-level rules against aggregate analysis stats.
function runRepositoryRules(stats) {
  const findings = [];

  for (const rule of REPOSITORY_LEVEL_RULES) {
    findings.push(...rule(stats));
  }

  return findings;
}

module.exports = {
  runFileRules,
  runRepositoryRules,
};
