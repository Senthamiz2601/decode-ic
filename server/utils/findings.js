// ─────────────────────────────────────────────
// Findings helpers
//
// createFinding() and getLineNumber() extracted verbatim from
// server.js. Every rule (see /rules) produces findings through
// createFinding() so the shape stays standardized:
//   { id, category, severity, title, description, file, line }
// ─────────────────────────────────────────────

function createFinding({
  category,
  severity,
  title,
  description,
  file,
  line,
}) {
  return {
    id: `${category}-${severity}-${file || 'repository'}-${line || 0}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    category,
    severity,
    title,
    description,
    file: file || null,
    line: line || null,
  };
}

function getLineNumber(content, index) {
  if (index < 0) {
    return null;
  }

  return content.slice(0, index).split(/\r?\n/).length;
}

module.exports = {
  createFinding,
  getLineNumber,
};
