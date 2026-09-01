const logger = require('../../utils/logger');

// Parses package.json — dependencies, devDependencies,
// peerDependencies, optionalDependencies. Logic unchanged from the
// original server.js.
function parsePackageJsonDependencies(content) {
  const dependencies = [];

  try {
    const packageJson = JSON.parse(content);

    const sections = [
      { object: packageJson.dependencies, type: 'runtime' },
      { object: packageJson.devDependencies, type: 'development' },
      { object: packageJson.peerDependencies, type: 'peer' },
      { object: packageJson.optionalDependencies, type: 'optional' },
    ];

    for (const section of sections) {
      if (!section.object) {
        continue;
      }

      for (const [name, version] of Object.entries(section.object)) {
        dependencies.push({
          name,
          version: String(version),
          type: section.type,
          ecosystem: 'npm',
          sourceFile: 'package.json',
        });
      }
    }
  } catch (error) {
    logger.error('package.json parsing error:', error.message);
  }

  return {
    count: dependencies.length,
    names: dependencies.map((dependency) => dependency.name),
    ecosystem: 'npm',
    details: dependencies,
  };
}

module.exports = { parsePackageJsonDependencies };
