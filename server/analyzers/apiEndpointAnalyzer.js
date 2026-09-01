// ─────────────────────────────────────────────
// API endpoint analyzer
//
// Detects HTTP route declarations across the supported frameworks.
// Logic unchanged from the original server.js detectApiEndpoints().
// ─────────────────────────────────────────────

const { getFileExtension } = require('./fileAnalyzer');
const { getLineNumber } = require('../utils/findings');

function detectApiEndpoints(content, filePath) {
  const extension = getFileExtension(filePath);

  const endpoints = [];

  // Express / Fastify / Node.js
  if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
    const expressPattern =
      /\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/g;

    for (const match of content.matchAll(expressPattern)) {
      endpoints.push({
        method: match[1].toUpperCase(),
        path: match[2],
        framework: 'Express',
        line: getLineNumber(content, match.index),
      });
    }

    const fastifyPattern =
      /\b(?:app|server|fastify)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;

    for (const match of content.matchAll(fastifyPattern)) {
      const alreadyDetected = endpoints.some(
        (endpoint) =>
          endpoint.method === match[1].toUpperCase() &&
          endpoint.path === match[2] &&
          endpoint.line === getLineNumber(content, match.index)
      );

      if (!alreadyDetected) {
        endpoints.push({
          method: match[1].toUpperCase(),
          path: match[2],
          framework: 'Fastify',
          line: getLineNumber(content, match.index),
        });
      }
    }
  }

  // Flask / Django
  if (extension === 'py') {
    const flaskPattern = /@(?:app|[\w]+)\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;

    for (const match of content.matchAll(flaskPattern)) {
      endpoints.push({
        method: match[1].toUpperCase(),
        path: match[2],
        framework: 'Flask',
        line: getLineNumber(content, match.index),
      });
    }

    const djangoPattern = /\bpath\s*\(\s*['"]([^'"]+)['"]/g;

    for (const match of content.matchAll(djangoPattern)) {
      endpoints.push({
        method: 'ROUTE',
        path: match[1],
        framework: 'Django',
        line: getLineNumber(content, match.index),
      });
    }
  }

  // Spring Boot
  if (['java', 'kt', 'kts'].includes(extension)) {
    const springPattern =
      /@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\s*(?:\(\s*(?:value\s*=\s*)?["']([^"']+)["']\s*\))?/g;

    for (const match of content.matchAll(springPattern)) {
      const methodMap = {
        GetMapping: 'GET',
        PostMapping: 'POST',
        PutMapping: 'PUT',
        PatchMapping: 'PATCH',
        DeleteMapping: 'DELETE',
        RequestMapping: 'ROUTE',
      };

      endpoints.push({
        method: methodMap[match[1]] || 'ROUTE',
        path: match[2] || '/',
        framework: 'Spring',
        line: getLineNumber(content, match.index),
      });
    }
  }

  // Laravel
  if (extension === 'php') {
    const laravelPattern = /Route::(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;

    for (const match of content.matchAll(laravelPattern)) {
      endpoints.push({
        method: match[1].toUpperCase(),
        path: match[2],
        framework: 'Laravel',
        line: getLineNumber(content, match.index),
      });
    }
  }

  return endpoints;
}

module.exports = { detectApiEndpoints };
