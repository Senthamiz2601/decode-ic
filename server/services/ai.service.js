// ─────────────────────────────────────────────
// Decode.IC AI Service
//
// Generates repository-grounded answers from the
// existing deterministic analysis result.
//
// No mock repository data is used here.
// ─────────────────────────────────────────────

function normalizeQuestion(question) {
  return String(question || '').trim().toLowerCase();
}

function getRepositoryName(repository) {
  return (
    repository.fullName ||
    `${repository.owner || ''}/${repository.name || ''}`.replace(/^\/|\/$/g, '') ||
    'this repository'
  );
}

function formatList(items, limit = 8) {
  return items.slice(0, limit);
}

function getAnalysisSummary(analysis) {
  return {
    files: analysis.fileCount || 0,
    lines: analysis.linesOfCode || 0,
    sourceFiles: analysis.sourceFileCount || 0,
    dependencies: analysis.dependencyCount || 0,
    components: analysis.componentCount || 0,
    endpoints: analysis.apiEndpointCount || 0,
    health: analysis.healthScore ?? 0,
    debt: analysis.technicalDebtPercent ?? 0,
    risk: analysis.riskLevel || 'unknown',
    findings: Array.isArray(analysis.findings) ? analysis.findings : [],
    languages: Array.isArray(analysis.languages) ? analysis.languages : [],
    dependenciesDetails: Array.isArray(analysis.dependencyDetails)
      ? analysis.dependencyDetails
      : [],
    apiEndpoints: Array.isArray(analysis.apiEndpoints)
      ? analysis.apiEndpoints
      : [],
    architecture: analysis.architecture || null,
  };
}

function answerQuestion(question, repository) {
  const analysis = repository.analysis;

  if (!analysis) {
    return {
      content:
        'This repository has not been analyzed yet. Run repository analysis first, then I can answer questions using its actual analysis data.',
      relatedFiles: [],
    };
  }

  const q = normalizeQuestion(question);
  const data = getAnalysisSummary(analysis);
  const repoName = getRepositoryName(repository);

  // ─────────────────────────────────────────
  // General repository overview
  // ─────────────────────────────────────────

  if (
    q.includes('overview') ||
    q.includes('summary') ||
    q.includes('about this repository') ||
    q.includes('repository') && q.includes('size')
  ) {
    const topLanguages = formatList(data.languages, 5)
      .map(
        (item) =>
          `${item.language} (${item.linesOfCode} LOC, ${item.percent}%)`,
      )
      .join(', ');

    return {
      content:
        `I analyzed ${repoName} using the latest repository analysis.\n\n` +
        `• Files analyzed: ${data.files}\n` +
        `• Source files: ${data.sourceFiles}\n` +
        `• Lines of code: ${data.lines}\n` +
        `• Components detected: ${data.components}\n` +
        `• Dependencies: ${data.dependencies}\n` +
        `• API endpoints: ${data.endpoints}\n` +
        `• Code health: ${data.health}/100\n` +
        `• Technical debt: ${data.debt}%\n` +
        `• Risk level: ${data.risk}\n\n` +
        `Main languages: ${topLanguages || 'No language data available.'}`,
      relatedFiles: [],
    };
  }

  // ─────────────────────────────────────────
  // Health
  // ─────────────────────────────────────────

  if (
    q.includes('health') ||
    q.includes('code quality') ||
    q.includes('quality score')
  ) {
    const findings = formatList(data.findings, 5);

    return {
      content:
        `The current code health score for ${repoName} is ${data.health}/100.\n\n` +
        `The analyzer detected ${data.findings.length} finding(s).` +
        (findings.length
          ? `\n\nThe first findings to review are:\n${findings
              .map((f, i) => `${i + 1}. ${formatFinding(f)}`)
              .join('\n')}`
          : '\n\nNo deterministic code findings were reported by the analyzer.'),
      relatedFiles: extractFindingFiles(findings),
    };
  }

  // ─────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────

  if (
    q.includes('dependenc') ||
    q.includes('package') ||
    q.includes('library') ||
    q.includes('libraries')
  ) {
    const dependencyNames = [];

    for (const manifest of data.dependenciesDetails) {
      for (const dependency of manifest.dependencies || []) {
        if (typeof dependency === 'string') {
          dependencyNames.push(dependency);
        } else if (dependency?.name) {
          dependencyNames.push(dependency.name);
        }
      }
    }

    return {
      content:
        `The analyzer detected ${data.dependencies} dependency package(s) across ` +
        `${data.dependenciesDetails.length} manifest(s).\n\n` +
        (dependencyNames.length
          ? `Detected packages include:\n${formatList(dependencyNames, 15)
              .map((name) => `• ${name}`)
              .join('\n')}`
          : 'The dependency count is available, but individual package names were not returned by the analyzer.'),
      relatedFiles: data.dependenciesDetails
        .map((item) => item.manifest)
        .filter(Boolean),
    };
  }

  // ─────────────────────────────────────────
  // API endpoints
  // ─────────────────────────────────────────

  if (
    q.includes('api') ||
    q.includes('endpoint') ||
    q.includes('route')
  ) {
    if (!data.apiEndpoints.length) {
      return {
        content:
          'The current analyzer did not detect any API endpoints in this repository.',
        relatedFiles: [],
      };
    }

    return {
      content:
        `The analyzer detected ${data.endpoints} API endpoint(s).\n\n` +
        formatList(data.apiEndpoints, 15)
          .map((endpoint, index) => {
            const method = endpoint.method || 'UNKNOWN';
            const path = endpoint.path || endpoint.route || 'unknown route';
            return `${index + 1}. ${method} ${path}`;
          })
          .join('\n'),
      relatedFiles: data.apiEndpoints
        .map((endpoint) => endpoint.file)
        .filter(Boolean)
        .slice(0, 10),
    };
  }

  // ─────────────────────────────────────────
  // Technical debt
  // ─────────────────────────────────────────

  if (
    q.includes('technical debt') ||
    q.includes('tech debt') ||
    q.includes('debt')
  ) {
    return {
      content:
        `The current technical debt estimate is ${data.debt}%.\n\n` +
        `This value is calculated from the repository's deterministic findings ` +
        `and analyzed lines of code. There are ${data.findings.length} total finding(s) ` +
        `currently contributing to the analysis.`,
      relatedFiles: extractFindingFiles(data.findings.slice(0, 10)),
    };
  }

  // ─────────────────────────────────────────
  // Risks
  // ─────────────────────────────────────────

  if (
    q.includes('risk') ||
    q.includes('danger') ||
    q.includes('problem') ||
    q.includes('issue')
  ) {
    const findings = formatList(data.findings, 10);

    return {
      content:
        `The repository's current calculated risk level is "${data.risk}".\n\n` +
        (findings.length
          ? `Current analyzer findings that may require attention:\n${findings
              .map((f, i) => `${i + 1}. ${formatFinding(f)}`)
              .join('\n')}`
          : 'No deterministic findings were reported by the analyzer.'),
      relatedFiles: extractFindingFiles(findings),
    };
  }

  // ─────────────────────────────────────────
  // Languages
  // ─────────────────────────────────────────

  if (
    q.includes('language') ||
    q.includes('technology') ||
    q.includes('tech stack')
  ) {
    return {
      content:
        `The repository contains ${data.languages.length} detected language(s).\n\n` +
        (data.languages.length
          ? data.languages
              .map(
                (item) =>
                  `• ${item.language}: ${item.linesOfCode} LOC (${item.percent}%)`,
              )
              .join('\n')
          : 'No language distribution is currently available.'),
      relatedFiles: [],
    };
  }

  // ─────────────────────────────────────────
  // Architecture
  // ─────────────────────────────────────────

  if (
    q.includes('architecture') ||
    q.includes('structure') ||
    q.includes('component')
  ) {
    const architecture = data.architecture;

    if (!architecture) {
      return {
        content:
          'Architecture analysis is not available in the current repository analysis.',
        relatedFiles: [],
      };
    }

    return {
      content:
        `The repository contains ${data.components} detected component(s).\n\n` +
        `The architecture analyzer has produced the current architecture view for ` +
        `${repoName}. Review the Architecture section for the complete component and ` +
        `relationship breakdown.`,
      relatedFiles: [],
    };
  }

  // ─────────────────────────────────────────
  // Default — grounded response
  // ─────────────────────────────────────────

  return {
    content:
      `I can answer questions about ${repoName} using its current repository analysis.\n\n` +
      `Available analyzed data includes ${data.files} files, ${data.lines} lines of code, ` +
      `${data.dependencies} dependencies, ${data.endpoints} API endpoints, ` +
      `a health score of ${data.health}/100, ${data.debt}% technical debt, ` +
      `and a "${data.risk}" risk level.\n\n` +
      `Try asking about the repository's architecture, dependencies, API endpoints, ` +
      `code health, technical debt, risks, languages, or overall structure.`,
    relatedFiles: [],
  };
}

function formatFinding(finding) {
  if (!finding) return 'Unknown finding';

  if (typeof finding === 'string') {
    return finding;
  }

  return (
    finding.message ||
    finding.description ||
    finding.title ||
    finding.rule ||
    JSON.stringify(finding)
  );
}

function extractFindingFiles(findings) {
  return findings
    .map((finding) => {
      if (typeof finding === 'string') return null;

      return (
        finding?.file ||
        finding?.filePath ||
        finding?.path ||
        finding?.sourceFile ||
        null
      );
    })
    .filter(Boolean)
    .slice(0, 10);
}

// ─────────────────────────────────────────────
// Repository-specific suggested questions
// ─────────────────────────────────────────────

function getSuggestedQuestions(repository) {
  const analysis = repository.analysis;

  if (!analysis) {
    return [
      'Has this repository been analyzed?',
      'What should I analyze first?',
    ];
  }

  const questions = [
    'Give me an overview of this repository',
    'How healthy is the current codebase?',
    'What are the main architectural components?',
  ];

  if ((analysis.dependencyCount || 0) > 0) {
    questions.push('What dependencies are used in this repository?');
  }

  if ((analysis.apiEndpointCount || 0) > 0) {
    questions.push('What API endpoints were detected?');
  }

  if ((analysis.technicalDebtPercent || 0) > 0) {
    questions.push('Where should I focus on technical debt?');
  }

  if ((analysis.findings || []).length > 0) {
    questions.push('What are the most important issues to fix?');
  }

  if ((analysis.riskLevel || '').toLowerCase() !== 'low') {
    questions.push('What are the current repository risks?');
  }

  if ((analysis.languages || []).length > 0) {
    questions.push('What languages and technologies does this repository use?');
  }

  return questions.slice(0, 6);
}

module.exports = {
  answerQuestion,
  getSuggestedQuestions,
};