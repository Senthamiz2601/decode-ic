import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, TrendingDown, ShieldAlert, Boxes, GitBranch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MetricCard, ChartCard } from '@/components/data-display';
import { Card, RiskBadge, Badge } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { listRepositories } from '@/services/repositoryService';
import { getRisks } from '@/services/riskService';
import type { Risk } from '@/types';

type RepoRecord = {
  id: string;
  name: string;
  language: string | null;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dependencyCount: number;
  lastAnalyzed: string;
  status: string;
  technicalDebtPercent: number;
};

// Overview is portfolio-wide intelligence across the repositories the
// person has actually connected and analyzed — everything here is
// derived from GET /api/repositories (and, for the "Top Risks" card,
// GET /api/repositories/:id/risks for the most recently analyzed
// one). There is no mock/demo data: an empty connection state shows
// a real empty state instead.
export default function Dashboard() {
  const [repos, setRepos] = useState<RepoRecord[]>([]);
  const [topRisks, setTopRisks] = useState<{ repoId: string; risks: Risk[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listRepositories();

      if (!result?.ok) {
        throw new Error('Failed to load repositories');
      }

      const list = (result.repositories as unknown as RepoRecord[]) || [];
      setRepos(list);

      const analyzed = list.find((r) => r.status === 'complete');

      if (analyzed) {
        const risksResult = await getRisks(analyzed.id);
        setTopRisks({ repoId: analyzed.id, risks: risksResult.risks?.slice(0, 3) || [] });
      } else {
        setTopRisks(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <LoadingState label="Loading overview…" />;
  }

  if (error) {
    return <ErrorState title="Could not load overview" reasons={[error]} onRetry={load} />;
  }

  if (repos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading text-2xl font-semibold">Overview</h1>
          <p className="text-muted text-sm mt-1">Portfolio-wide intelligence across all connected repositories.</p>
        </div>
        <Card className="p-6">
          <EmptyState
            title="No repositories connected yet"
            description="Connect and analyze a GitHub repository to see real portfolio intelligence here."
            cta="Connect GitHub"
          />
        </Card>
      </div>
    );
  }

  const analyzedRepos = repos.filter((r) => r.status === 'complete');
  const totalDeps = analyzedRepos.reduce((s, r) => s + (r.dependencyCount || 0), 0);
  const highRiskCount = repos.filter((r) => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
  const avgHealth = analyzedRepos.length
    ? Math.round(analyzedRepos.reduce((s, r) => s + (r.healthScore || 0), 0) / analyzedRepos.length)
    : null;
  const avgDebt = analyzedRepos.length
    ? Math.round(analyzedRepos.reduce((s, r) => s + (r.technicalDebtPercent || 0), 0) / analyzedRepos.length)
    : null;

  const riskDistribution = [
    { name: 'Low', value: repos.filter((r) => r.riskLevel === 'low').length, color: '#4edea3' },
    { name: 'Medium', value: repos.filter((r) => r.riskLevel === 'medium').length, color: '#facc15' },
    { name: 'High', value: repos.filter((r) => r.riskLevel === 'high' || r.riskLevel === 'critical').length, color: '#ffb4ab' },
  ];
  const hasRiskData = riskDistribution.some((r) => r.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading text-2xl font-semibold">Overview</h1>
        <p className="text-muted text-sm mt-1">Portfolio-wide intelligence across all connected repositories.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Codebase Health"
          value={avgHealth !== null ? `${avgHealth}/100` : 'Not available'}
          icon={HeartPulse}
          tone="success"
        />
        <MetricCard
          label="Technical Debt"
          value={avgDebt !== null ? `${avgDebt}%` : 'Not available'}
          icon={TrendingDown}
          tone="warning"
        />
        <MetricCard label="High Risk Repositories" value={String(highRiskCount)} icon={ShieldAlert} tone="danger" />
        <MetricCard label="Dependencies" value={totalDeps.toLocaleString()} icon={Boxes} />
        <MetricCard label="Repositories" value={String(repos.length)} icon={GitBranch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Risk Distribution" subtitle="Across connected repositories">
          {hasRiskData ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {riskDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {riskDistribution.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="size-2 rounded-full" style={{ background: r.color }} /> {r.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-sm py-10 text-center">Not available yet.</p>
          )}
        </ChartCard>

        <Card className="p-5 lg:col-span-2">
          <h3 className="text-heading font-semibold text-sm mb-4">Top Risks</h3>
          {topRisks && topRisks.risks.length > 0 ? (
            <div className="space-y-3">
              {topRisks.risks.map((r) => (
                <Link key={r.id} to={`/repositories/${topRisks.repoId}/risks`} className="flex items-center justify-between gap-3 group">
                  <div className="min-w-0">
                    <div className="text-body text-sm truncate group-hover:text-heading transition-colors">{r.title}</div>
                    <div className="text-muted text-xs truncate">{r.module}</div>
                  </div>
                  <RiskBadge level={r.level} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No risk findings yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-heading font-semibold text-sm">Repositories</h3>
          <Link to="/repositories" className="text-accent-light text-sm hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {repos.map((repo) => (
            <Link key={repo.id} to={`/repositories/${repo.id}`} className="block border border-border rounded-md p-4 hover:border-accent/50 hover:bg-surface-raised/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-heading text-sm font-medium truncate">{repo.name}</span>
                <RiskBadge level={repo.riskLevel} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{repo.language || 'Unknown'}</Badge>
                <span className="text-muted text-xs">{repo.lastAnalyzed}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Health</span>
                <span className="font-mono text-heading">{repo.healthScore}/100</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
