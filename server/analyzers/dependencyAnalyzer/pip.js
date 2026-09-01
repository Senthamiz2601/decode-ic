// Parses requirements.txt. Logic unchanged from the original server.js.
function parseRequirementsDependencies(content) {
  const dependencies = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('-r') ||
      trimmed.startsWith('--')
    ) {
      continue;
    }

    const match = trimmed.match(
      /^([A-Za-z0-9_.-]+)(?:\s*(?:==|>=|<=|~=|!=|>|<)\s*([^\s;]+))?/
    );

    if (match) {
      dependencies.push({
        name: match[1],
        version: match[2] || '',
        ecosystem: 'pip',
        sourceFile: 'requirements.txt',
      });
    }
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name.toLowerCase(), dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'pip',
    details: uniqueDependencies,
  };
}

module.exports = { parseRequirementsDependencies };
