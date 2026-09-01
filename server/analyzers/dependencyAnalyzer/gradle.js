// Parses build.gradle / build.gradle.kts. Logic unchanged from the
// original server.js (previously part of parseSimpleManifestDependencies).
function parseGradleDependencies(fileName, content) {
  const dependencies = [];

  const matches = content.matchAll(
    /^\s*(?:implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s+['"]([^'"]+)['"]/gm
  );

  for (const match of matches) {
    dependencies.push({
      name: match[1],
      version: '',
      ecosystem: 'gradle',
      sourceFile: fileName,
    });
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name, dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'gradle',
    details: uniqueDependencies,
  };
}

module.exports = { parseGradleDependencies };
