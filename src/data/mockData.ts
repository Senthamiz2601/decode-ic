import type {
  Repository, ArchitectureNode, ArchitectureEdge, DependencyNode, Risk,
  TechnicalDebtIssue, CodeHealth, AIMessage, Report, AppNotification, FileNode, User,
} from '@/types';

export const currentUser: User = {
  id: 'u_1',
  name: 'Priya Nathan',
  email: 'priya.nathan@decode.ic',
  avatarInitials: 'PN',
  role: 'Staff Engineer',
};

export const repositories: Repository[] = [
  {
    id: 'skyline-research-platform',
    name: 'skyline-research-platform',
    owner: 'orbital-labs',
    description: 'Core research data platform: ingestion, analysis pipelines, and the researcher-facing web app.',
    primaryLanguage: 'TypeScript',
    languages: [
      { language: 'TypeScript', percent: 58 },
      { language: 'Python', percent: 26 },
      { language: 'SQL', percent: 10 },
      { language: 'Other', percent: 6 },
    ],
    fileCount: 126,
    linesOfCode: 18420,
    dependencyCount: 138,
    componentCount: 42,
    apiEndpointCount: 31,
    healthScore: 84,
    technicalDebtPercent: 24,
    riskLevel: 'medium',
    lastAnalyzed: '12 minutes ago',
    status: 'complete',
    branch: 'main',
    stars: 214,
  },
  {
    id: 'core-api',
    name: 'core-api',
    owner: 'orbital-labs',
    description: 'Primary REST + GraphQL API gateway serving all internal and partner clients.',
    primaryLanguage: 'Go',
    languages: [
      { language: 'Go', percent: 74 },
      { language: 'SQL', percent: 14 },
      { language: 'YAML', percent: 12 },
    ],
    fileCount: 289,
    linesOfCode: 41250,
    dependencyCount: 96,
    componentCount: 18,
    apiEndpointCount: 87,
    healthScore: 91,
    technicalDebtPercent: 12,
    riskLevel: 'low',
    lastAnalyzed: '2 hours ago',
    status: 'complete',
    branch: 'main',
    stars: 88,
  },
  {
    id: 'billing-service',
    name: 'billing-service',
    owner: 'orbital-labs',
    description: 'Subscription billing, invoicing, and payment provider integrations.',
    primaryLanguage: 'Python',
    languages: [
      { language: 'Python', percent: 82 },
      { language: 'SQL', percent: 18 },
    ],
    fileCount: 94,
    linesOfCode: 12980,
    dependencyCount: 61,
    componentCount: 9,
    apiEndpointCount: 22,
    healthScore: 67,
    technicalDebtPercent: 38,
    riskLevel: 'high',
    lastAnalyzed: '1 day ago',
    status: 'complete',
    branch: 'main',
    stars: 41,
  },
  {
    id: 'design-system',
    name: 'design-system',
    owner: 'orbital-labs',
    description: 'Shared React component library and design tokens used across all frontends.',
    primaryLanguage: 'TypeScript',
    languages: [
      { language: 'TypeScript', percent: 91 },
      { language: 'CSS', percent: 9 },
    ],
    fileCount: 203,
    linesOfCode: 15870,
    dependencyCount: 47,
    componentCount: 118,
    apiEndpointCount: 0,
    healthScore: 96,
    technicalDebtPercent: 6,
    riskLevel: 'low',
    lastAnalyzed: '3 hours ago',
    status: 'complete',
    branch: 'main',
    stars: 302,
  },
  {
    id: 'ingestion-pipeline',
    name: 'ingestion-pipeline',
    owner: 'orbital-labs',
    description: 'Batch and streaming data ingestion jobs for third-party research feeds.',
    primaryLanguage: 'Python',
    languages: [
      { language: 'Python', percent: 88 },
      { language: 'SQL', percent: 12 },
    ],
    fileCount: 71,
    linesOfCode: 9340,
    dependencyCount: 54,
    componentCount: 6,
    apiEndpointCount: 4,
    healthScore: 73,
    technicalDebtPercent: 29,
    riskLevel: 'medium',
    lastAnalyzed: '6 hours ago',
    status: 'complete',
    branch: 'develop',
    stars: 19,
  },
  {
    id: 'mobile-companion',
    name: 'mobile-companion',
    owner: 'orbital-labs',
    description: 'React Native companion app for field researchers.',
    primaryLanguage: 'TypeScript',
    languages: [
      { language: 'TypeScript', percent: 95 },
      { language: 'Swift', percent: 3 },
      { language: 'Kotlin', percent: 2 },
    ],
    fileCount: 158,
    linesOfCode: 14210,
    dependencyCount: 82,
    componentCount: 64,
    apiEndpointCount: 0,
    healthScore: 79,
    technicalDebtPercent: 21,
    riskLevel: 'medium',
    lastAnalyzed: '1 day ago',
    status: 'complete',
    branch: 'main',
    stars: 57,
  },
];

export const primaryRepo = repositories[0];

export const codeHealth: CodeHealth = {
  overall: 84,
  architecture: 87,
  maintainability: 82,
  dependencies: 79,
  complexity: 86,
  risk: 78,
  testing: 91,
  trend: [
    { date: 'Mar', score: 74 },
    { date: 'Apr', score: 76 },
    { date: 'May', score: 78 },
    { date: 'Jun', score: 79 },
    { date: 'Jul', score: 81 },
    { date: 'Aug', score: 84 },
  ],
};

export const architectureNodes: ArchitectureNode[] = [
  { id: 'web-app', label: 'Researcher Web App', type: 'frontend', layer: 0, risk: 'low', complexity: 'medium', dependencies: 6, dependents: 0, description: 'Next.js frontend for researchers to browse datasets and results.' },
  { id: 'mobile-app', label: 'Field Mobile App', type: 'frontend', layer: 0, risk: 'low', complexity: 'medium', dependencies: 3, dependents: 0, description: 'React Native app used for on-site data capture.' },
  { id: 'api-gateway', label: 'API Gateway', type: 'api', layer: 1, risk: 'low', complexity: 'low', dependencies: 5, dependents: 2, description: 'Routes and authenticates all inbound requests.' },
  { id: 'auth-service', label: 'AuthService', type: 'service', layer: 2, risk: 'high', complexity: 'medium', dependencies: 8, dependents: 14, description: 'Handles login, session issuance, and token validation for every downstream service.' },
  { id: 'analysis-engine', label: 'Analysis Engine', type: 'service', layer: 2, risk: 'medium', complexity: 'high', dependencies: 11, dependents: 6, description: 'Runs statistical pipelines against ingested datasets.' },
  { id: 'ingestion-service', label: 'Ingestion Service', type: 'service', layer: 2, risk: 'medium', complexity: 'high', dependencies: 9, dependents: 3, description: 'Normalizes and validates incoming research feeds.' },
  { id: 'notification-service', label: 'Notification Service', type: 'service', layer: 2, risk: 'low', complexity: 'low', dependencies: 4, dependents: 3, description: 'Sends email/webhook notifications for job completion.' },
  { id: 'primary-db', label: 'PostgreSQL', type: 'database', layer: 3, risk: 'low', complexity: 'medium', dependencies: 0, dependents: 12, description: 'Primary relational store for datasets and metadata.' },
  { id: 'object-store', label: 'Object Storage', type: 'database', layer: 3, risk: 'low', complexity: 'low', dependencies: 0, dependents: 5, description: 'Raw file storage for uploaded datasets.' },
  { id: 'third-party-feed', label: 'Partner Data Feeds', type: 'external', layer: 3, risk: 'medium', complexity: 'low', dependencies: 0, dependents: 1, description: 'External partner APIs supplying raw research data.' },
];

export const architectureEdges: ArchitectureEdge[] = [
  { source: 'web-app', target: 'api-gateway', kind: 'calls' },
  { source: 'mobile-app', target: 'api-gateway', kind: 'calls' },
  { source: 'api-gateway', target: 'auth-service', kind: 'calls' },
  { source: 'api-gateway', target: 'analysis-engine', kind: 'calls' },
  { source: 'api-gateway', target: 'ingestion-service', kind: 'calls' },
  { source: 'analysis-engine', target: 'notification-service', kind: 'calls' },
  { source: 'auth-service', target: 'primary-db', kind: 'queries' },
  { source: 'analysis-engine', target: 'primary-db', kind: 'queries' },
  { source: 'ingestion-service', target: 'primary-db', kind: 'queries' },
  { source: 'ingestion-service', target: 'object-store', kind: 'queries' },
  { source: 'ingestion-service', target: 'third-party-feed', kind: 'calls' },
  { source: 'notification-service', target: 'primary-db', kind: 'queries' },
];

export const dependencyNodes: DependencyNode[] = [
  { id: 'react', name: 'react', version: '18.3.1', type: 'direct', license: 'MIT', outdated: false, unused: false, usedBy: ['web-app', 'design-system'], dependsOn: [], circular: false },
  { id: 'next', name: 'next', version: '14.2.3', type: 'direct', license: 'MIT', outdated: true, unused: false, usedBy: ['web-app'], dependsOn: ['react'], circular: false },
  { id: 'prisma', name: 'prisma', version: '5.14.0', type: 'direct', license: 'Apache-2.0', outdated: false, unused: false, usedBy: ['api-gateway', 'auth-service'], dependsOn: [], circular: false },
  { id: 'lodash', name: 'lodash', version: '4.17.21', type: 'indirect', license: 'MIT', outdated: false, unused: true, usedBy: ['analysis-engine'], dependsOn: [], circular: false },
  { id: 'auth-core', name: '@internal/auth-core', version: '2.3.0', type: 'direct', license: 'Proprietary', outdated: false, unused: false, usedBy: ['auth-service', 'api-gateway'], dependsOn: ['jsonwebtoken'], circular: true },
  { id: 'jsonwebtoken', name: 'jsonwebtoken', version: '9.0.2', type: 'indirect', license: 'MIT', outdated: false, unused: false, usedBy: ['auth-core'], dependsOn: [], circular: true },
  { id: 'pandas', name: 'pandas', version: '2.1.0', type: 'direct', license: 'BSD-3', outdated: true, unused: false, usedBy: ['analysis-engine', 'ingestion-service'], dependsOn: [], circular: false },
  { id: 'axios', name: 'axios', version: '1.7.2', type: 'direct', license: 'MIT', outdated: false, unused: false, usedBy: ['web-app', 'mobile-app'], dependsOn: [], circular: false },
];

export const risks: Risk[] = [
  {
    id: 'risk-1', title: 'Authentication Service', module: 'auth-service', level: 'high', score: 88,
    reasons: ['High coupling — 14 dependents across the platform', 'High cyclomatic complexity in token refresh logic', 'No automated tests for the OAuth fallback path'],
    affectedFiles: ['src/auth/AuthService.ts', 'src/auth/TokenRefresh.ts', 'src/middleware/auth.ts'],
    recommendation: 'Investigate — isolate token refresh into a pure function and add regression tests before the next OAuth migration.',
  },
  {
    id: 'risk-2', title: 'Billing Reconciliation Job', module: 'billing-service', level: 'high', score: 81,
    reasons: ['Handles financial data with no idempotency guard', 'Recent incident history (2 in last quarter)', 'Silent failure mode on partial provider outages'],
    affectedFiles: ['jobs/reconcile_invoices.py', 'services/payment_provider.py'],
    recommendation: 'Add idempotency keys and alerting on partial failures before next billing cycle.',
  },
  {
    id: 'risk-3', title: 'Analysis Engine Query Layer', module: 'analysis-engine', level: 'medium', score: 58,
    reasons: ['Several N+1 query patterns under load', 'Growing function size (>400 lines) in query builder'],
    affectedFiles: ['engine/query_builder.py'],
    recommendation: 'Refactor query builder into composable filters; add query plan tests.',
  },
  {
    id: 'risk-4', title: 'Partner Feed Ingestion', module: 'ingestion-service', level: 'medium', score: 52,
    reasons: ['External dependency on undocumented partner schema', 'Retry logic lacks backoff'],
    affectedFiles: ['ingestion/partner_feed.py'],
    recommendation: 'Add schema validation at the boundary and exponential backoff on retries.',
  },
  {
    id: 'risk-5', title: 'Notification Templates', module: 'notification-service', level: 'low', score: 24,
    reasons: ['Minor duplication across email templates'],
    affectedFiles: ['notifications/templates/'],
    recommendation: 'Low priority — consolidate shared template partials when convenient.',
  },
];

export const technicalDebtIssues: TechnicalDebtIssue[] = [
  { id: 'td-1', title: 'AuthService.refreshToken is 340 lines', category: 'large-function', severity: 'high', file: 'src/auth/AuthService.ts', description: 'Single function handles validation, refresh, retry, and logging in one block.', estimatedEffort: '~2 days' },
  { id: 'td-2', title: 'Duplicated invoice formatting logic', category: 'duplication', severity: 'medium', file: 'services/invoice_formatter.py', description: 'Same formatting logic re-implemented in 3 modules with subtle differences.', estimatedEffort: '~1 day' },
  { id: 'td-3', title: 'High coupling between UI and API client', category: 'coupling', severity: 'medium', file: 'src/pages/Dashboard.tsx', description: 'Components call the API client directly instead of going through hooks.', estimatedEffort: '~3 days' },
  { id: 'td-4', title: 'Unused feature-flag branches', category: 'unused-code', severity: 'low', file: 'src/utils/featureFlags.ts', description: '6 flags have been fully rolled out but dead branches remain.', estimatedEffort: '~4 hours' },
  { id: 'td-5', title: 'Query builder mixes business logic and SQL', category: 'separation-of-concerns', severity: 'medium', file: 'engine/query_builder.py', description: 'Filtering rules and raw SQL construction are interleaved.', estimatedEffort: '~2 days' },
  { id: 'td-6', title: 'Cyclomatic complexity spike in ingestion parser', category: 'complexity', severity: 'high', file: 'ingestion/partner_feed.py', description: 'Nested conditionals for schema variants push complexity to 24.', estimatedEffort: '~2 days' },
];

export const aiSuggestedQuestions = [
  'How is authentication implemented in this repository?',
  'What would break if I change the billing webhook handler?',
  'Where is technical debt concentrated right now?',
  'Which modules have circular dependencies?',
];

export const aiMessages: AIMessage[] = [
  {
    id: 'm1', role: 'user', timestamp: '10:02 AM',
    content: 'How is authentication implemented in this repository?',
  },
  {
    id: 'm2', role: 'assistant', timestamp: '10:02 AM',
    content: 'Authentication is handled through AuthService, which issues and validates session tokens, backed by a shared middleware layer that runs on every request. The login flow in the frontend collects credentials, sends them through the API client, and stores the returned session token. Token refresh happens transparently through the same service, though it currently carries the highest coupling in the codebase — 14 modules depend on it.',
    relatedFiles: ['src/auth/AuthService.ts', 'src/middleware/auth.ts', 'src/components/Login.tsx'],
  },
];

export const fileTree: FileNode[] = [
  {
    id: 'src', name: 'src', type: 'folder', path: 'src', children: [
      { id: 'src/components', name: 'components', type: 'folder', path: 'src/components', children: [
        { id: 'f1', name: 'Login.tsx', type: 'file', path: 'src/components/Login.tsx', language: 'typescript' },
        { id: 'f2', name: 'Dashboard.tsx', type: 'file', path: 'src/components/Dashboard.tsx', language: 'typescript' },
      ]},
      { id: 'src/auth', name: 'auth', type: 'folder', path: 'src/auth', children: [
        { id: 'f3', name: 'AuthService.ts', type: 'file', path: 'src/auth/AuthService.ts', language: 'typescript' },
        { id: 'f4', name: 'TokenRefresh.ts', type: 'file', path: 'src/auth/TokenRefresh.ts', language: 'typescript' },
      ]},
      { id: 'src/services', name: 'services', type: 'folder', path: 'src/services', children: [
        { id: 'f5', name: 'apiClient.ts', type: 'file', path: 'src/services/apiClient.ts', language: 'typescript' },
      ]},
      { id: 'src/middleware', name: 'middleware', type: 'folder', path: 'src/middleware', children: [
        { id: 'f6', name: 'auth.ts', type: 'file', path: 'src/middleware/auth.ts', language: 'typescript' },
      ]},
      { id: 'f7', name: 'App.tsx', type: 'file', path: 'src/App.tsx', language: 'typescript' },
    ],
  },
];

export const codeSnippet = `import { verifyToken } from './TokenRefresh';

export class AuthService {
  async validateSession(token: string) {
    const claims = await verifyToken(token);
    if (!claims) {
      throw new UnauthorizedError('Session expired');
    }
    return claims;
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    const valid = await this.hasher.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');
    return this.issueSession(user);
  }
}`;

export const reports: Report[] = [
  { id: 'r1', title: 'Repository Health Report', type: 'health', generatedAt: '2 days ago', summary: 'Overall health, subscores, and trend for skyline-research-platform.' },
  { id: 'r2', title: 'Architecture Report', type: 'architecture', generatedAt: '4 days ago', summary: 'Layered service map, coupling hotspots, and layer violations.' },
  { id: 'r3', title: 'Risk Report', type: 'risk', generatedAt: '1 day ago', summary: 'Ranked risks with reasons, affected files, and recommendations.' },
  { id: 'r4', title: 'Technical Debt Report', type: 'technical-debt', generatedAt: '6 hours ago', summary: 'Debt breakdown by category with estimated remediation effort.' },
  { id: 'r5', title: 'Impact Analysis Report', type: 'impact', generatedAt: '3 hours ago', summary: 'Latest change-impact run for updateUserProfile().' },
  { id: 'r6', title: 'AI Codebase Summary', type: 'ai-summary', generatedAt: '1 week ago', summary: 'Narrative summary of architecture, hotspots, and recommended focus areas.' },
];

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Analysis completed', description: 'skyline-research-platform finished analyzing 126 files.', type: 'analysis', timestamp: '12 min ago', read: false },
  { id: 'n2', title: 'New high-risk issue detected', description: 'AuthService coupling crossed the high-risk threshold.', type: 'risk', timestamp: '1 hour ago', read: false },
  { id: 'n3', title: 'Technical debt increased', description: 'billing-service debt rose from 33% to 38%.', type: 'debt', timestamp: '1 day ago', read: true },
  { id: 'n4', title: 'Dependency issue found', description: 'Circular dependency detected between auth-core and jsonwebtoken.', type: 'dependency', timestamp: '2 days ago', read: true },
  { id: 'n5', title: 'Impact analysis completed', description: 'updateUserProfile() impact score: 82/100.', type: 'impact', timestamp: '3 days ago', read: true },
];
