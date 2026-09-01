// ─────────────────────────────────────────────
// Decode.IC — Architecture Analyzer
//
// Builds a deterministic architecture map from the
// actual repository file tree.
//
// Input:
//   repository tree returned by GitHub
//
// Output:
//   {
//     nodes: [...],
//     edges: [...],
//     summary: {...}
//   }
//
// No mock architecture data is used.
// ─────────────────────────────────────────────

const path = require('path');

function normalizePath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function getDirectory(filePath) {
  const normalized = normalizePath(filePath);
  const parts = normalized.split('/');

  if (parts.length <= 1) {
    return null;
  }

  return parts.slice(0, -1).join('/');
}

function getTopLevelDirectory(filePath) {
  const normalized = normalizePath(filePath);
  const parts = normalized.split('/');

  return parts.length > 1 ? parts[0] : null;
}

function detectNodeType(filePath) {
  const normalized = normalizePath(filePath).toLowerCase();

  if (
    normalized.includes('node_modules') ||
    normalized.includes('.git')
  ) {
    return 'external';
  }

  if (
    normalized.includes('/component') ||
    normalized.includes('/components') ||
    normalized.includes('/pages') ||
    normalized.includes('/views') ||
    normalized.includes('/screens') ||
    normalized.includes('/hooks') ||
    normalized.includes('/styles') ||
    normalized.includes('/assets') ||
    normalized.startsWith('src/')
  ) {
    return 'frontend';
  }

  if (
    normalized.includes('/route') ||
    normalized.includes('/routes') ||
    normalized.includes('/controller') ||
    normalized.includes('/controllers') ||
    normalized.includes('/middleware') ||
    normalized.includes('/api')
  ) {
    return 'api';
  }

  if (
    normalized.includes('/service') ||
    normalized.includes('/services') ||
    normalized.includes('/utils') ||
    normalized.includes('/helpers') ||
    normalized.includes('/lib')
  ) {
    return 'service';
  }

  if (
    normalized.includes('/model') ||
    normalized.includes('/models') ||
    normalized.includes('/schema') ||
    normalized.includes('/schemas') ||
    normalized.includes('/database') ||
    normalized.includes('/db')
  ) {
    return 'database';
  }

  return 'file';
}

function getLayer(type) {
  switch (type) {
    case 'frontend':
      return 0;

    case 'api':
      return 1;

    case 'service':
      return 2;

    case 'database':
      return 3;

    case 'external':
      return 4;

    default:
      return 2;
  }
}

function getComplexity(fileCount) {
  if (fileCount >= 50) {
    return 'high';
  }

  if (fileCount >= 15) {
    return 'medium';
  }

  return 'low';
}

function getRisk(fileCount, type) {
  if (type === 'database' && fileCount >= 10) {
    return 'high';
  }

  if (fileCount >= 50) {
    return 'medium';
  }

  return 'low';
}

function createNodeId(directory) {
  return `architecture:${directory.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function analyzeArchitecture({ files = [] }) {
  const directoryMap = new Map();

  for (const file of files) {
    const filePath =
      typeof file === 'string'
        ? file
        : file?.path;

    if (!filePath) {
      continue;
    }

    const normalized = normalizePath(filePath);
    const directory = getDirectory(normalized);

    if (!directory) {
      continue;
    }

    if (!directoryMap.has(directory)) {
      directoryMap.set(directory, {
        path: directory,
        files: [],
      });
    }

    directoryMap.get(directory).files.push(normalized);
  }

  const nodes = [];

  for (const [directory, data] of directoryMap.entries()) {
    const representativeFile = data.files[0];

    const type = detectNodeType(representativeFile);
    const layer = getLayer(type);

    nodes.push({
      id: createNodeId(directory),
      label: directory.split('/').pop(),
      path: directory,

      type,
      layer,

      description: `${type} layer containing ${data.files.length} file${
        data.files.length === 1 ? '' : 's'
      }.`,

      risk: getRisk(data.files.length, type),
      complexity: getComplexity(data.files.length),

      dependencies: 0,
      dependents: 0,

      fileCount: data.files.length,
    });
  }

  // Sort nodes by architectural layer and path.
  nodes.sort((a, b) => {
    if (a.layer !== b.layer) {
      return a.layer - b.layer;
    }

    return a.path.localeCompare(b.path);
  });

  // ─────────────────────────────────────────────
  // Build parent → child relationships
  // ─────────────────────────────────────────────

  const edges = [];

  const directorySet = new Set(
    nodes.map((node) => node.path)
  );

  for (const node of nodes) {
    const parent = path.posix.dirname(node.path);

    if (
      parent !== '.' &&
      directorySet.has(parent)
    ) {
      edges.push({
        id: `${createNodeId(parent)}-${node.id}`,
        source: createNodeId(parent),
        target: node.id,
        kind: 'contains',
      });
    }
  }

  // ─────────────────────────────────────────────
  // Build high-level layer relationships
  // ─────────────────────────────────────────────

  const layerGroups = new Map();

  for (const node of nodes) {
    if (!layerGroups.has(node.layer)) {
      layerGroups.set(node.layer, []);
    }

    layerGroups.get(node.layer).push(node);
  }

  const addLayerConnections = (fromLayer, toLayer, kind) => {
    const fromNodes = layerGroups.get(fromLayer) || [];
    const toNodes = layerGroups.get(toLayer) || [];

    if (!fromNodes.length || !toNodes.length) {
      return;
    }

    // Connect only the first representative node from each
    // layer to avoid creating an unreadable graph.
    const source = fromNodes[0];
    const target = toNodes[0];

    const exists = edges.some(
      (edge) =>
        edge.source === source.id &&
        edge.target === target.id
    );

    if (!exists) {
      edges.push({
        id: `${source.id}-${target.id}-${kind}`,
        source: source.id,
        target: target.id,
        kind,
      });
    }
  };

  addLayerConnections(0, 1, 'calls');
  addLayerConnections(1, 2, 'calls');
  addLayerConnections(2, 3, 'uses');

  // ─────────────────────────────────────────────
  // Calculate dependency counters
  // ─────────────────────────────────────────────

  for (const edge of edges) {
    const source = nodes.find(
      (node) => node.id === edge.source
    );

    const target = nodes.find(
      (node) => node.id === edge.target
    );

    if (source) {
      source.dependencies += 1;
    }

    if (target) {
      target.dependents += 1;
    }
  }

  const summary = {
    nodeCount: nodes.length,
    edgeCount: edges.length,

    frontendNodes: nodes.filter(
      (node) => node.type === 'frontend'
    ).length,

    apiNodes: nodes.filter(
      (node) => node.type === 'api'
    ).length,

    serviceNodes: nodes.filter(
      (node) => node.type === 'service'
    ).length,

    databaseNodes: nodes.filter(
      (node) => node.type === 'database'
    ).length,
  };

  return {
    nodes,
    edges,
    summary,
  };
}

module.exports = {
  analyzeArchitecture,
};