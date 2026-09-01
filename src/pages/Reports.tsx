import React, { useCallback, useEffect, useState } from 'react';
import { Download, FileBarChart } from 'lucide-react';
import { Button, Card, Badge } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { listRepositories, getRepository } from '@/services/repositoryService';
import { listReports } from '@/services/reportService';
import type { Report } from '@/types';

// This page has no :id in its route, so it reports on the first
// connected, analyzed repository — consistent with the rest of this
// project, which currently works with one connected repository at a
// time. Reports are assembled live from that repository's current
// analysis; there is no persisted report history to browse.
export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [repositoryId, setRepositoryId] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const repoResult = await listRepositories();

      if (!repoResult?.ok) {
        throw new Error('Failed to load repositories');
      }

      const analyzed = (repoResult.repositories || []).find((r) => r.status === 'complete');

      if (!analyzed) {
        setReports([]);
        setRepositoryName('');
        setRepositoryId('');
        return;
      }

      setRepositoryName(analyzed.name);
      setRepositoryId(analyzed.id);

      const result = await listReports(analyzed.id);

      if (!result?.ok) {
        throw new Error(result?.message || 'Failed to load reports');
      }

      setReports(result.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Builds a downloadable JSON snapshot straight from the repository's
  // current real analysis (no report-generation dependency needed).
  // Every field below traces back to the same analysis object the
  // rest of this app already renders.
  const handleDownload = useCallback(async () => {
    if (!repositoryId) return;

    try {
      setDownloading(true);

      const result = await getRepository(repositoryId);

      if (!result?.ok || !result.repository) {
        throw new Error(result?.message || 'Failed to load repository for download');
      }

      const repo = result.repository;
      const analysis = repo.analysis || {};

      const payload = {
        repository: repo.fullName || `${repo.owner}/${repo.name}`,
        branch: repo.branch,
        analyzedAt: analysis.analyzedAt || repo.lastAnalyzed,
        fileCount: repo.fileCount,
        linesOfCode: repo.linesOfCode,
        dependencyCount: repo.dependencyCount,
        componentCount: repo.componentCount,
        apiEndpointCount: repo.apiEndpointCount,
        healthScore: repo.healthScore,
        technicalDebtPercent: repo.technicalDebtPercent,
        riskLevel: repo.riskLevel,
        languages: repo.languages,
        architecture: analysis.architecture || 'Not available',
        risks: analysis.findings || [],
        reports,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(repo.name || 'repository').replace(/[^a-z0-9-_]/gi, '_')}-report.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  }, [repositoryId, reports]);

  if (loading) {
    return <LoadingState label="Loading reports…" />;
  }

  if (error) {
    return <ErrorState title="Could not load reports" reasons={[error]} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading text-2xl font-semibold">Reports</h1>
          <p className="text-muted text-sm mt-1">
            {repositoryName
              ? `Current analysis summary for ${repositoryName}.`
              : 'Analyze a repository to generate reports.'}
          </p>
        </div>

        {repositoryId && (
          <Button size="sm" variant="secondary" onClick={handleDownload} disabled={downloading}>
            <Download size={14} />
            {downloading ? 'Preparing…' : 'Download Report'}
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No reports available"
          description="Connect and analyze a repository first — reports are generated from its analysis results."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-9 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                  <FileBarChart size={16} className="text-accent-light" />
                </div>
                <div>
                  <h3 className="text-heading font-semibold text-sm">{r.title}</h3>
                  <Badge className="mt-1">{new Date(r.generatedAt).toLocaleString()}</Badge>
                </div>
              </div>
              <p className="text-muted text-xs flex-1">{r.summary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
