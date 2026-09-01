// ─────────────────────────────────────────────
// Repository analyzer
//
// Orchestrates a full repository analysis: file discovery -> file
// filtering -> content fetching -> language stats / LOC / comments ->
// component detection -> API endpoint detection -> dependency
// detection -> code findings -> health/debt/risk. Logic unchanged
// from the original server.js analyzeRepositoryData(), just split
// across the dedicated analyzer/rule/service modules so each concern
// is independently extensible.
// ─────────────────────────────────────────────

const logger = require('../../utils/logger');
const { analyzeArchitecture } = require('./architectureAnalyzer');
const { GITHUB_BLOB_BATCH_SIZE, dependencyManifestNames } = require('../../utils/constants');
const {
  isExcluded,
  isBinaryFile,
  isSourceFile,
  getLanguageFromFile,
  countCodeLines,
  countCommentLines,
} = require('../../analyzers/fileAnalyzer');
const { detectApiEndpoints } = require('../../analyzers/apiEndpointAnalyzer');
const { parseDependencyManifest } = require('../../analyzers/dependencyAnalyzer');
const { runFileRules, runRepositoryRules } = require('../../rules');
const {
  calculatePercent,
  calculateHealthScore,
  calculateTechnicalDebt,
  calculateRiskLevel,
} = require('../../utils/metrics');
const githubService = require('../github.service');

async function analyzeRepositoryData({ repository, branch, excludedFolders }) {
  const owner = repository.owner;
  const repo = repository.name;

  const treeData = await githubService.fetchRepositoryTree(owner, repo, branch);

  const files = (treeData.tree || []).filter(
    (item) =>
      item.type === 'blob' &&
      item.path &&
      !isExcluded(item.path, excludedFolders) &&
      !isBinaryFile(item.path)
  );

  logger.info(`Files found for analysis: ${files.length}`);

  let linesOfCode = 0;
  let commentLines = 0;
  let componentCount = 0;

  const languageStats = {};
  const apiEndpoints = [];
  const findings = [];
  const dependencyDetails = [];

  const manifestFiles = new Map();

  // Fetch all file contents in small batches. Batch size preserved
  // from the original implementation to keep GitHub API usage
  // behavior identical (no uncontrolled burst of requests).
  for (let index = 0; index < files.length; index += GITHUB_BLOB_BATCH_SIZE) {
    const batch = files.slice(index, index + GITHUB_BLOB_BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const content = await githubService.fetchBlobContent(owner, repo, file.sha);
          return { file, content };
        } catch (error) {
          logger.error(`Failed to analyze file ${file.path}:`, error.message);
          return { file, content: null };
        }
      })
    );

    for (const result of results) {
      const { file, content } = result;

      if (content === null) {
        continue;
      }

      const filePath = file.path;

      const language = getLanguageFromFile(filePath);
      const fileLines = countCodeLines(content);
      const fileCommentLines = countCommentLines(content);

      linesOfCode += fileLines;
      commentLines += fileCommentLines;

      languageStats[language] = (languageStats[language] || 0) + fileLines;

      // React component detection
      if (/\.(jsx|tsx)$/i.test(filePath)) {
        componentCount += 1;
      }

      // API endpoint detection
      const detectedEndpoints = detectApiEndpoints(content, filePath);

      for (const endpoint of detectedEndpoints) {
        apiEndpoints.push({ ...endpoint, file: filePath });
      }

      // Code findings (deterministic rules)
      findings.push(...runFileRules(content, filePath));

      // Dependency manifest collection
      const fileName = filePath.split('/').pop();

      if (dependencyManifestNames.includes(fileName)) {
        logger.debug('Dependency manifest found:', filePath);
        manifestFiles.set(filePath, content);
      }
    }
  }

  // ─────────────────────────────────
  // Dependency analysis (after all files processed)
  // ─────────────────────────────────

  let dependencyCount = 0;

  for (const [manifestPath, content] of manifestFiles.entries()) {
    const fileName = manifestPath.split('/').pop();
    const result = parseDependencyManifest(fileName, content);

    if (result.count > 0) {
      dependencyCount += result.count;

      dependencyDetails.push({
        manifest: manifestPath,
        ecosystem: result.ecosystem,
        count: result.count,
        dependencies: result.names,
        details: result.details || [],
      });
    }
  }

  // ─────────────────────────────────
  // Language percentages based on LOC
  // ─────────────────────────────────

  const languages = Object.entries(languageStats)
    .map(([language, loc]) => ({
      language,
      linesOfCode: loc,
      percent: calculatePercent(loc, linesOfCode),
    }))
    .sort((a, b) => b.linesOfCode - a.linesOfCode);

  // ─────────────────────────────────
  // Repository-level findings
  // ─────────────────────────────────

  findings.push(
    ...runRepositoryRules({
      dependencyCount,
      apiEndpointCount: apiEndpoints.length,
      linesOfCode,
    })
  );

  // ─────────────────────────────────
  // Final metrics
  // ─────────────────────────────────

  const healthScore = calculateHealthScore({
    fileCount: files.length,
    linesOfCode,
    dependencyCount,
    findings,
  });

  const technicalDebtPercent = calculateTechnicalDebt({ linesOfCode, findings });
  const riskLevel = calculateRiskLevel(findings);

  const architecture = analyzeArchitecture({
  files,
});

  return {

  architecture,
  
    fileCount: files.length,
    linesOfCode,
    commentLines,

    sourceFileCount: files.filter((file) => isSourceFile(file.path)).length,

    dependencyCount,
    dependencyDetails,

    componentCount,

    apiEndpointCount: apiEndpoints.length,
    apiEndpoints,

    healthScore,
    technicalDebtPercent,
    riskLevel,

    languages,
    findings,

    analyzedAt: new Date().toISOString(),
    analyzedFiles: files.length,

    treeTruncated: treeData.truncated === true,
  };
}

module.exports = { analyzeRepositoryData };
