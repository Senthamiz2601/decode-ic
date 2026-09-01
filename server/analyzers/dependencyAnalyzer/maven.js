// Parses pom.xml. Logic unchanged from the original server.js
// (previously part of parseSimpleManifestDependencies).
function parseMavenDependencies(fileName, content) {
  const dependencies = [];

  const matches = content.matchAll(
    /<dependency>[\s\S]*?<artifactId>\s*([^<]+)\s*<\/artifactId>[\s\S]*?<\/dependency>/g
  );

  for (const match of matches) {
    const artifactId = match[1].trim();

    if (artifactId) {
      dependencies.push({
        name: artifactId,
        version: '',
        ecosystem: 'maven',
        sourceFile: fileName,
      });
    }
  }

  const uniqueDependencies = Array.from(
    new Map(dependencies.map((dependency) => [dependency.name, dependency])).values()
  );

  return {
    count: uniqueDependencies.length,
    names: uniqueDependencies.map((dependency) => dependency.name),
    ecosystem: 'maven',
    details: uniqueDependencies,
  };
}

module.exports = { parseMavenDependencies };
