// ─────────────────────────────────────────────
// File analyzer / file utilities
//
// Reusable, dependency-free logic for reasoning about a single file
// path or a single file's content. Extracted verbatim (logic
// unchanged) from server.js. Other analyzers and services should
// use these instead of re-implementing extension/LOC/comment logic.
// ─────────────────────────────────────────────

const {
  excludedDefaults,
  sourceExtensions,
  binaryExtensions,
  languageMap,
} = require('../utils/constants');

function isExcluded(filePath, excludedFolders = []) {
  const folders = [...excludedDefaults, ...excludedFolders];

  return folders.some((folder) => {
    const cleanFolder = String(folder || '')
      .trim()
      .replace(/^[/\\]+|[/\\]+$/g, '');

    if (!cleanFolder) {
      return false;
    }

    return (
      filePath === cleanFolder ||
      filePath.startsWith(`${cleanFolder}/`) ||
      filePath.includes(`/${cleanFolder}/`)
    );
  });
}

function getFileExtension(filePath) {
  const fileName = filePath.split('/').pop() || '';

  if (!fileName.includes('.')) {
    return '';
  }

  return fileName.split('.').pop()?.toLowerCase() || '';
}

function getLanguageFromFile(filePath) {
  const extension = getFileExtension(filePath);
  return languageMap[extension] || 'Other';
}

function isBinaryFile(filePath) {
  const extension = getFileExtension(filePath);
  return binaryExtensions.has(extension);
}

function isSourceFile(filePath) {
  const extension = getFileExtension(filePath);
  return sourceExtensions.has(extension);
}

function countCodeLines(content) {
  if (!content) {
    return 0;
  }

  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
}

function countCommentLines(content) {
  if (!content) {
    return 0;
  }

  const lines = content.split(/\r?\n/);

  let count = 0;
  let insideBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (insideBlockComment) {
      count += 1;

      if (trimmed.includes('*/')) {
        insideBlockComment = false;
      }

      continue;
    }

    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('<!--')
    ) {
      count += 1;
      continue;
    }

    if (
      trimmed.startsWith('/*') ||
      trimmed.startsWith('"""') ||
      trimmed.startsWith("'''")
    ) {
      count += 1;

      if (
        (trimmed.startsWith('/*') && !trimmed.includes('*/')) ||
        (trimmed.startsWith('"""') && trimmed.length < 6) ||
        (trimmed.startsWith("'''") && trimmed.length < 6)
      ) {
        insideBlockComment = true;
      }
    }
  }

  return count;
}

module.exports = {
  isExcluded,
  getFileExtension,
  getLanguageFromFile,
  isBinaryFile,
  isSourceFile,
  countCodeLines,
  countCommentLines,
};
