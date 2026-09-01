import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  MoreHorizontal,
  GitBranch,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  ExternalLink,
} from 'lucide-react';

import { Button, Card, RiskBadge, Badge } from '@/components/primitives';
import { Table, Tr, Td } from '@/components/data-display';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import {
  listRepositories,
  reanalyzeRepository,
  removeRepository,
} from '@/services/repositoryService';

// Real, backend-connected repository shape, matching what
// repositoryService.listRepositories() returns (see
// server/services/repository.service.js).
type RepoRecord = {
  id: string;
  name: string;
  owner: string;
  language: string | null;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dependencyCount: number;
  lastAnalyzed: string;
  status: 'connected' | 'analyzing' | 'complete' | 'failed' | string;
};

export default function Repositories() {
  const [repos, setRepos] = useState<RepoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listRepositories();

      if (!result?.ok) {
        throw new Error('Failed to load repositories');
      }

      setRepos((result.repositories as unknown as RepoRecord[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reanalyze(id: string) {
    try {
      setBusyId(id);
      await reanalyzeRepository(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-analyze repository');
    } finally {
      setBusyId(null);
      setMenuFor(null);
    }
  }

  async function remove(id: string) {
    try {
      setBusyId(id);
      await removeRepository(id);
      setRepos((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove repository');
    } finally {
      setBusyId(null);
      setMenuFor(null);
    }
  }

  const analyzingCount = repos.filter((repo) => repo.status === 'analyzing').length;

  const healthyCount = repos.filter(
    (repo) => repo.status !== 'analyzing' && repo.healthScore >= 80,
  ).length;

  const riskCount = repos.filter(
    (repo) =>
      repo.status !== 'analyzing' &&
      ['high', 'critical'].includes(repo.riskLevel),
  ).length;

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <GitBranch size={14} />
            <span>Code intelligence</span>
            <span>/</span>
            <span>Repositories</span>
          </div>

          <h1 className="text-heading text-2xl font-semibold tracking-tight">
            Repositories
          </h1>

          <p className="text-muted text-sm mt-1">
            Connect, analyze, and monitor your codebases from one place.
          </p>
        </div>

        <Link to="/repositories/new">
          <Button className="w-full sm:w-auto">
            <Plus size={16} />
            Connect GitHub Repository
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState label="Loading repositories…" />
      ) : error ? (
        <ErrorState title="Could not load repositories" reasons={[error]} onRetry={load} />
      ) : (
        <>
          {/* Summary Cards */}
          {repos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SummaryCard
                icon={<GitBranch size={17} />}
                label="Connected"
                value={repos.length}
                description="Repositories"
              />

              <SummaryCard
                icon={<CheckCircle2 size={17} />}
                label="Healthy"
                value={healthyCount}
                description="80+ health score"
              />

              <SummaryCard
                icon={<ShieldAlert size={17} />}
                label="At Risk"
                value={riskCount}
                description="High or critical risk"
              />

              <SummaryCard
                icon={<Activity size={17} />}
                label="Analyzing"
                value={analyzingCount}
                description="Currently running"
              />
            </div>
          )}

          {/* Repository List */}
          {repos.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="No repositories connected"
                description="Connect a GitHub repository and let Decode.ic analyze its architecture, code health, dependencies, risks, and technical debt."
                cta="Connect GitHub"
              />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Table Header */}
              <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-heading text-sm font-semibold">
                    Connected repositories
                  </h2>
                  <p className="text-muted text-xs mt-1">
                    {repos.length} {repos.length === 1 ? 'repository' : 'repositories'} connected
                  </p>
                </div>

                {analyzingCount > 0 && (
                  <div className="inline-flex items-center gap-2 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full bg-accent-light animate-pulse" />
                    {analyzingCount} analysis in progress
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table
                  headers={[
                    'Repository',
                    'Language',
                    'Health',
                    'Risk',
                    'Dependencies',
                    'Last Analyzed',
                    '',
                  ]}
                >
                  {repos.map((repo) => (
                    <Tr key={repo.id}>
                      {/* Repository */}
                      <Td className="min-w-[220px]">
                        <Link
                          to={`/repositories/${repo.id}`}
                          className="group flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised text-muted group-hover:text-accent-light transition-colors">
                            <GitBranch size={15} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-heading font-medium truncate group-hover:text-accent-light transition-colors">
                                {repo.name}
                              </span>

                              <ExternalLink
                                size={12}
                                className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>

                            <div className="text-muted text-xs mt-0.5 truncate">
                              {repo.owner}
                            </div>
                          </div>
                        </Link>
                      </Td>

                      {/* Language */}
                      <Td>
                        <Badge>{repo.language || 'Unknown'}</Badge>
                      </Td>

                      {/* Health */}
                      <Td>
                        {repo.status === 'analyzing' ? (
                          <div className="flex items-center gap-2 text-muted text-sm">
                            <Activity size={14} className="animate-pulse" />
                            <span>Analyzing</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <HealthIndicator score={repo.healthScore} />

                            <span className="font-mono text-sm text-heading">
                              {repo.healthScore}
                            </span>

                            <span className="text-muted text-xs">/100</span>
                          </div>
                        )}
                      </Td>

                      {/* Risk */}
                      <Td>
                        {repo.status === 'analyzing' ? (
                          <Badge tone="accent">Analyzing…</Badge>
                        ) : (
                          <RiskBadge level={repo.riskLevel} />
                        )}
                      </Td>

                      {/* Dependencies */}
                      <Td>
                        <span className="font-mono text-sm text-body">
                          {repo.dependencyCount}
                        </span>
                      </Td>

                      {/* Last Analyzed */}
                      <Td>
                        <div className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
                          <Clock3 size={13} />
                          {repo.lastAnalyzed}
                        </div>
                      </Td>

                      {/* Actions */}
                      <Td>
                        <div className="relative flex justify-end">
                          <button
                            aria-label={`Actions for ${repo.name}`}
                            onClick={() =>
                              setMenuFor(
                                menuFor === repo.id ? null : repo.id,
                              )
                            }
                            className="rounded-md p-1.5 text-muted hover:bg-surface-raised hover:text-heading transition-colors"
                          >
                            <MoreHorizontal size={17} />
                          </button>

                          {menuFor === repo.id && (
                            <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
                              <Link
                                to={`/repositories/${repo.id}`}
                                onClick={() => setMenuFor(null)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-body hover:bg-surface-raised transition-colors"
                              >
                                <ExternalLink size={14} />
                                Open repository
                              </Link>

                              <button
                                onClick={() => reanalyze(repo.id)}
                                disabled={repo.status === 'analyzing' || busyId === repo.id}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-body hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <RefreshCw
                                  size={14}
                                  className={
                                    repo.status === 'analyzing' || busyId === repo.id
                                      ? 'animate-spin'
                                      : ''
                                  }
                                />
                                Re-analyze
                              </button>

                              <Link
                                to="/settings"
                                onClick={() => setMenuFor(null)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-body hover:bg-surface-raised transition-colors"
                              >
                                <Settings size={14} />
                                Repository settings
                              </Link>

                              <div className="my-1 border-t border-border" />

                              <button
                                onClick={() => remove(repo.id)}
                                disabled={busyId === repo.id}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-50 transition-colors"
                              >
                                <Trash2 size={14} />
                                Remove repository
                              </button>
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Summary Card
───────────────────────────────────────────── */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-raised text-muted">
          {icon}
        </div>

        <span className="font-mono text-xl font-semibold text-heading">
          {value}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-heading">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Health Indicator
───────────────────────────────────────────── */

function HealthIndicator({ score }: { score: number }) {
  let indicatorClass = 'bg-danger';

  if (score >= 80) {
    indicatorClass = 'bg-emerald-400';
  } else if (score >= 60) {
    indicatorClass = 'bg-amber-400';
  }

  return (
    <span
      className={`h-2 w-2 rounded-full ${indicatorClass}`}
      title={`Health score ${score}/100`}
    />
  );
}
