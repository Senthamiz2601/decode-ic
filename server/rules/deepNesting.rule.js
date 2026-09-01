const { createFinding } = require('../utils/findings');

// Flags sections of a file with deeply nested brace blocks.
// Logic unchanged from the original server.js detectCodeFindings().
function deepNestingRule(content, filePath, lines) {
  const findings = [];

  let nestingDepth = 0;
  let deepNestingReported = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Ignore empty lines.
    if (!trimmed) {
      return;
    }

    // Ignore simple comment lines.
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('<!--')
    ) {
      return;
    }

    const openingBraces = (line.match(/{/g) || []).length;
    const closingBraces = (line.match(/}/g) || []).length;

    const previousDepth = nestingDepth;

    nestingDepth += openingBraces;
    nestingDepth -= closingBraces;

    if (nestingDepth < 0) {
      nestingDepth = 0;
    }

    // Report only when the code first crosses the deep-nesting threshold.
    if (previousDepth < 5 && nestingDepth >= 5 && !deepNestingReported) {
      findings.push(
        createFinding({
          category: 'Complexity',
          severity: 'medium',
          title: 'Potentially deep nesting',
          description:
            'This section appears to contain deeply nested blocks and may be harder to understand or maintain.',
          file: filePath,
          line: index + 1,
        })
      );

      deepNestingReported = true;
    }

    // Allow another finding if nesting later returns to a normal
    // level and becomes deep again.
    if (nestingDepth < 3) {
      deepNestingReported = false;
    }
  });

  return findings;
}

module.exports = deepNestingRule;
