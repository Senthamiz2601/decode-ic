// Parses pyproject.toml.
//
// BUG FIX (see refactor notes): the original implementation only
// recognized YAML-style "- name" list lines, which is not how a
// standard pyproject.toml expresses dependencies (PEP 621 uses
// `dependencies = ["name>=1.0", ...]`, and Poetry uses
// `[tool.poetry.dependencies]` tables). That original matching
// logic is preserved below unchanged so nothing that used to be
// detected stops being detected, and it has been extended
// (additively) to also recognize the standard TOML array and
// Poetry table forms. This only adds detections; it never removes
// any dependency the previous version would have found.
function parsePyProjectDependencies(content) {
  const dependencies = [];

  // ── Original behavior: YAML-list-style lines ──
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') && !trimmed.startsWith('- python')) {
      const dependency = trimmed.slice(2).split(/[<>=!~;]/)[0].trim();

      if (dependency) {
        dependencies.push({
          name: dependency,
          version: '',
          ecosystem: 'python',
          sourceFile: 'pyproject.toml',
        });
      }
    }
  }

  // ── Additive: PEP 621 `dependencies = [...]` array ──
  const arrayMatch = content.match(/(?:^|\n)\s*dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (arrayMatch) {
    const entries = arrayMatch[1].matchAll(/["']([^"']+)["']/g);
    for (const entry of entries) {
      const spec = entry[1].trim();
      const name = spec.split(/[<>=!~;\s]/)[0].trim();
      if (name && name.toLowerCase() !== 'python') {
        dependencies.push({
          name,
          version: '',
          ecosystem: 'python',
          sourceFile: 'pyproject.toml',
        });
      }
    }
  }

  // ── Additive: Poetry `[tool.poetry.dependencies]` table ──
  const poetrySectionMatch = content.match(
    /\[tool\.poetry(?:\.dev)?-?dependencies\]([\s\S]*?)(?:\n\[|$)/
  );
  if (poetrySectionMatch) {
    for (const line of poetrySectionMatch[1].split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }
      const name = trimmed.split('=')[0].trim().replace(/^["']|["']$/g, '');
      if (name && name.toLowerCase() !== 'python') {
        dependencies.push({
          name,
          version: '',
          ecosystem: 'python',
          sourceFile: 'pyproject.toml',
        });
      }
    }
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name.toLowerCase(), dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'python',
    details: uniqueDependencies,
  };
}

module.exports = { parsePyProjectDependencies };
