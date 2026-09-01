// Parses Gemfile. Logic unchanged from the original server.js.
function parseGemfileDependencies(content) {
  const dependencies = [];

  const matches = content.matchAll(/^\s*gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/gm);

  for (const match of matches) {
    dependencies.push({
      name: match[1],
      version: match[2] || '',
      ecosystem: 'ruby',
      sourceFile: 'Gemfile',
    });
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name, dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'ruby',
    details: uniqueDependencies,
  };
}

module.exports = { parseGemfileDependencies };
