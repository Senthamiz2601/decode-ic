// Parses go.mod. Logic unchanged from the original server.js.
function parseGoModDependencies(content) {
  const dependencies = [];

  const matches = content.matchAll(/^\s*([A-Za-z0-9._/-]+)\s+v([^\s]+)(?:\s*\/\/.*)?$/gm);

  for (const match of matches) {
    dependencies.push({
      name: match[1],
      version: match[2] || '',
      ecosystem: 'go',
      sourceFile: 'go.mod',
    });
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name, dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'go',
    details: uniqueDependencies,
  };
}

module.exports = { parseGoModDependencies };
