// Parses Cargo.toml. Logic unchanged from the original server.js.
function parseCargoDependencies(content) {
  const dependencies = [];

  let insideDependencies = false;

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed === '[dependencies]' || trimmed === '[dev-dependencies]') {
      insideDependencies = true;
      continue;
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      insideDependencies = false;
    }

    if (!insideDependencies) {
      continue;
    }

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    const name = trimmed.slice(0, separatorIndex).trim();
    const version = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');

    if (name) {
      dependencies.push({
        name,
        version,
        ecosystem: 'cargo',
        sourceFile: 'Cargo.toml',
      });
    }
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name, dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'cargo',
    details: uniqueDependencies,
  };
}

module.exports = { parseCargoDependencies };
