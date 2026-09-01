export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AnalysisStatus = 'idle' | 'connecting' | 'scanning' | 'analyzing' | 'complete' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role: string;
}

// Authenticated user shape, driven by the (temporary, local) auth layer.
// This is intentionally separate from the `User` mock-data shape above.
export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface LanguageBreakdown {
  language: string;
  percent: number;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  primaryLanguage: string;
  languages: LanguageBreakdown[];
  fileCount: number;
  linesOfCode: number;
  dependencyCount: number;
  componentCount: number;
  apiEndpointCount: number;
  healthScore: number;
  technicalDebtPercent: number;
  riskLevel: RiskLevel;
  lastAnalyzed: string;
  status: AnalysisStatus;
  branch: string;
  defaultBranch?: string;
  stars: number;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'api' | 'service' | 'database' | 'external' | 'file';
  layer: number;
  risk: RiskLevel;
  complexity: 'low' | 'medium' | 'high';
  dependencies: number;
  dependents: number;
  description: string;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  kind: 'calls' | 'imports' | 'queries' | 'extends';
}

export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  type: 'direct' | 'indirect';
  license: string;
  outdated: boolean;
  unused: boolean;
  usedBy: string[];
  dependsOn: string[];
  circular: boolean;
}

export interface Risk {
  id: string;
  title: string;
  module: string;
  level: RiskLevel;
  score: number;
  reasons: string[];
  affectedFiles: string[];
  recommendation: string;
}

export interface TechnicalDebtIssue {
  id: string;
  title: string;
  category: 'complexity' | 'duplication' | 'coupling' | 'large-function' | 'unused-code' | 'separation-of-concerns';
  severity: RiskLevel;
  file: string;
  description: string;
  estimatedEffort: string;
}

export interface CodeHealth {
  overall: number;
  architecture: number;
  maintainability: number;
  dependencies: number;
  complexity: number;
  risk: number;
  testing: number;
  trend: { date: string; score: number }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedFiles?: string[];
  timestamp: string;
}

export interface ImpactAnalysis {
  target: string;
  targetType: 'function' | 'file' | 'component' | 'api';
  impactScore: number;
  directDependencies: string[];
  indirectDependencies: string[];
  affectedComponents: string[];
  affectedApis: string[];
  databaseOperations: string[];
  relatedTests: string[];
}

export interface SimulationResult {
  description: string;
  affected: string[];
  estimatedRisk: RiskLevel;
  migrationPlan: string[];
}

export interface RefactorSuggestion {
  id: string;
  title: string;
  severity: RiskLevel;
  problem: string;
  explanation: string;
  recommendation: string[];
  affectedFiles: string[];
  suggestedTests: string[];
}

export interface Report {
  id: string;
  title: string;
  type: 'health' | 'architecture' | 'risk' | 'technical-debt' | 'dependencies' | 'impact' | 'ai-summary';
  generatedAt: string;
  summary: string;
}

// ── Real analysis-backed shapes ──────────────────
// These mirror what GET /repositories/:id/dependencies and
// GET /repositories/:id/technical-debt actually return (derived from
// the analyzer's dependencyDetails/findings) — distinct from the
// richer DependencyNode/TechnicalDebtIssue mock shapes above, which
// assume data (license, outdated, unused, a fixed debt taxonomy)
// the analyzer does not currently compute.
export interface DependencyManifestEntry {
  name: string;
  version: string | null;
  type: string | null;
  ecosystem: string;
  sourceFile: string;
}

export interface DependencyManifest {
  manifest: string;
  ecosystem: string;
  count: number;
  dependencies: DependencyManifestEntry[];
}

export interface TechnicalDebtFinding {
  id: string;
  title: string;
  category: string;
  severity: RiskLevel;
  file: string | null;
  line: number | null;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'analysis' | 'risk' | 'debt' | 'dependency' | 'impact';
  timestamp: string;
  read: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  language?: string;
  children?: FileNode[];
}
