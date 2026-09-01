const logger = require('../../utils/logger');

// Parses composer.json. Logic unchanged from the original server.js.
function parseComposerDependencies(content) {
  try {
    const composer = JSON.parse(content);

    const dependencies = {
      ...(composer.require || {}),
      ...(composer['require-dev'] || {}),
    };

    const names = Object.keys(dependencies);

    return {
      count: names.length,
      names,
      ecosystem: 'composer',
      details: names.map((name) => ({
        name,
        version: String(dependencies[name] || ''),
        ecosystem: 'composer',
        sourceFile: 'composer.json',
      })),
    };
  } catch (error) {
    logger.error('composer.json parsing error:', error.message);

    return {
      count: 0,
      names: [],
      ecosystem: 'composer',
      details: [],
    };
  }
}

module.exports = { parseComposerDependencies };
