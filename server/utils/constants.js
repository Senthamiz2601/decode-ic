// ─────────────────────────────────────────────
// Shared constants
//
// Extracted verbatim from the original server.js so that behavior
// is unchanged. Any analyzer/service that needs one of these lists
// should import it from here instead of redefining it locally.
// ─────────────────────────────────────────────

const excludedDefaults = [
  'node_modules',
  'dist',
  '.next',
  'build',
  '.git',
  'coverage',
  'out',
  'vendor',
];

const sourceExtensions = new Set([
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'java',
  'c',
  'h',
  'cpp',
  'hpp',
  'cs',
  'go',
  'rs',
  'php',
  'rb',
  'swift',
  'kt',
  'kts',
  'scala',
  'dart',
]);

const dependencyManifestNames = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'composer.json',
  'Gemfile',
  'go.mod',
  'Cargo.toml',
];

const binaryExtensions = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'svg',
  'bmp',
  'tiff',
  'mp3',
  'wav',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'pdf',
  'zip',
  'tar',
  'gz',
  '7z',
  'rar',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  'exe',
  'dll',
  'so',
  'dylib',
  'class',
  'jar',
]);

const languageMap = {
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  py: 'Python',
  java: 'Java',
  c: 'C',
  h: 'C',
  cpp: 'C++',
  hpp: 'C++',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  rb: 'Ruby',
  swift: 'Swift',
  kt: 'Kotlin',
  kts: 'Kotlin',
  scala: 'Scala',
  dart: 'Dart',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  md: 'Markdown',
  xml: 'XML',
  sh: 'Shell',
};

// GitHub blob-fetch batch size. Preserved from the original
// implementation to keep API usage behavior identical.
const GITHUB_BLOB_BATCH_SIZE = 10;

module.exports = {
  excludedDefaults,
  sourceExtensions,
  dependencyManifestNames,
  binaryExtensions,
  languageMap,
  GITHUB_BLOB_BATCH_SIZE,
};
