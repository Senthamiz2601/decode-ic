// ─────────────────────────────────────────────
// Dependency analyzer
//
// Central dispatcher: given a manifest file name and its content,
// routes to the right ecosystem-specific parser and returns a
// standardized result:
//   { count, names, ecosystem, details }
//
// To add support for a new manifest type: write a new parser module
// in this folder, then add one line to the `parsers` map below.
// ─────────────────────────────────────────────

const { parsePackageJsonDependencies } = require('./npm');
const { parseRequirementsDependencies } = require('./pip');
const { parsePyProjectDependencies } = require('./pyproject');
const { parseGoModDependencies } = require('./go');
const { parseCargoDependencies } = require('./cargo');
const { parseComposerDependencies } = require('./composer');
const { parseGemfileDependencies } = require('./gemfile');
const { parseMavenDependencies } = require('./maven');
const { parseGradleDependencies } = require('./gradle');

const EMPTY_RESULT = { count: 0, names: [], ecosystem: 'unknown', details: [] };

const parsers = {
  'package.json': (content) => parsePackageJsonDependencies(content),
  'requirements.txt': (content) => parseRequirementsDependencies(content),
  'pyproject.toml': (content) => parsePyProjectDependencies(content),
  'go.mod': (content) => parseGoModDependencies(content),
  'Cargo.toml': (content) => parseCargoDependencies(content),
  'composer.json': (content) => parseComposerDependencies(content),
  Gemfile: (content) => parseGemfileDependencies(content),
  'pom.xml': (content, fileName) => parseMavenDependencies(fileName, content),
  'build.gradle': (content, fileName) => parseGradleDependencies(fileName, content),
  'build.gradle.kts': (content, fileName) => parseGradleDependencies(fileName, content),
};

function parseDependencyManifest(fileName, content) {
  if (!content) {
    return EMPTY_RESULT;
  }

  const parser = parsers[fileName];

  if (!parser) {
    return EMPTY_RESULT;
  }

  return parser(content, fileName);
}

module.exports = { parseDependencyManifest };
