import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Code2,
  FileCode2,
  GitBranch,
  HeartPulse,
  Layers3,
  Network,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Zap,
} from 'lucide-react';

import { Card, Button } from '@/components/primitives';
import { HealthScore } from '@/components/data-display';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/states';

import { getRepository } from '@/services/repositoryService';
import type { Repository } from '@/types';

export default function CodeHealth() {
  const { id } = useParams();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getRepository(id);

      if (!result?.ok) {
        throw new Error(
          result?.message || 'Failed to load repository',
        );
      }

      setRepository(result.repository);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load repository',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const healthLabel = useMemo(() => {
    if (!repository) return 'Unavailable';

    const score = repository.healthScore;

    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Healthy';
    if (score >= 60) return 'Needs Attention';
    if (score >= 40) return 'At Risk';

    return 'Critical';
  }, [repository]);

  const healthDescription = useMemo(() => {
    if (!repository) return '';

    const score = repository.healthScore;

    if (score >= 90) {
      return 'The repository is in strong overall health with limited detected issues.';
    }

    if (score >= 75) {
      return 'The repository is generally healthy, with some areas worth monitoring.';
    }

    if (score >= 60) {
      return 'Several findings may affect maintainability and should be reviewed.';
    }

    if (score >= 40) {
      return 'The analyzer detected significant issues that need engineering attention.';
    }

    return 'The repository has critical health concerns that should be investigated.';
  }, [repository]);

  if (loading) {
    return <LoadingState label="Loading code health…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load code health"
        reasons={[error]}
        onRetry={load}
      />
    );
  }

  if (!repository || repository.status !== 'complete') {
    return (
      <EmptyState
        icon={HeartPulse}
        title="Code health is not available yet"
        description="Analyze this repository first to calculate a health score."
      />
    );
  }

  const stats = [
    {
      label: 'Lines of Code',
      value: repository.linesOfCode.toLocaleString(),
      icon: Code2,
      description: 'Analyzed source lines',
    },
    {
      label: 'Files Analyzed',
      value: repository.fileCount.toLocaleString(),
      icon: FileCode2,
      description: 'Repository files',
    },
    {
      label: 'Components',
      value: repository.componentCount.toLocaleString(),
      icon: Layers3,
      description: 'Detected components',
    },
    {
      label: 'Dependencies',
      value: repository.dependencyCount.toLocaleString(),
      icon: Network,
      description: 'Detected dependencies',
    },
    {
      label: 'API Endpoints',
      value: repository.apiEndpointCount.toLocaleString(),
      icon: Workflow,
      description: 'Detected endpoints',
    },
    {
      label: 'Technical Debt',
      value: `${repository.technicalDebtPercent}%`,
      icon: Activity,
      description: 'Estimated debt exposure',
    },
  ];

  return (
    <div className="space-y-6 pb-6">

      {/* ─────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────── */}

      <div className="flex items-start justify-between gap-4 flex-wrap">

        <div className="flex items-start gap-3">

          <div
            className="
              size-11 shrink-0
              rounded-xl
              bg-gradient-to-br
              from-success/20
              to-accent/5
              border border-success/20
              flex items-center justify-center
              shadow-[0_0_28px_rgba(34,197,94,0.08)]
            "
          >
            <HeartPulse
              size={20}
              className="text-success"
            />
          </div>

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <h1 className="text-heading text-2xl font-semibold">
                Code Health
              </h1>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-success/20
                  bg-success/5
                  px-2 py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-success
                "
              >
                <span className="size-1.5 rounded-full bg-success" />
                Analyzed
              </span>

            </div>

            <p className="text-muted text-sm mt-1">
              Overall health and quality metrics from the current repository analysis.
            </p>

          </div>

        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={load}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw
            size={13}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </Button>

      </div>


      {/* ─────────────────────────────────────────────
          HEALTH OVERVIEW
      ───────────────────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">

        {/* Main score */}

        <Card
          className="
            relative overflow-hidden
            p-6
            flex flex-col
            items-center
            justify-center
            min-h-[300px]
            border-border/80
          "
        >

          <div
            className="
              absolute
              -top-20
              -right-20
              size-48
              rounded-full
              bg-success/5
              blur-3xl
            "
          />

          <div className="relative flex flex-col items-center">

            <div className="mb-4">

              <HealthScore
                score={repository.healthScore}
                size={170}
              />

            </div>

            <div className="flex items-center gap-2">

              {repository.healthScore >= 75 ? (
                <CheckCircle2
                  size={15}
                  className="text-success"
                />
              ) : (
                <Activity
                  size={15}
                  className="text-warning"
                />
              )}

              <span className="text-heading text-sm font-semibold">
                {healthLabel}
              </span>

            </div>

            <p className="text-muted text-xs mt-2 text-center max-w-xs leading-5">
              {healthDescription}
            </p>

          </div>

        </Card>


        {/* Analysis summary */}

        <Card className="p-6">

          <div className="flex items-center justify-between mb-5">

            <div>

              <div className="flex items-center gap-2">

                <div
                  className="
                    size-7 rounded-md
                    bg-accent/10
                    border border-accent/15
                    flex items-center justify-center
                  "
                >
                  <Zap
                    size={14}
                    className="text-accent-light"
                  />
                </div>

                <h3 className="text-heading font-semibold text-sm">
                  Health Overview
                </h3>

              </div>

              <p className="text-muted text-xs mt-1 ml-9">
                Current repository analysis snapshot.
              </p>

            </div>

            <span className="font-mono text-xs text-muted">
              {repository.healthScore}/100
            </span>

          </div>


          <div className="space-y-5">

            {/* Health bar */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs text-body">
                  Overall health
                </span>

                <span className="font-mono text-xs text-success">
                  {repository.healthScore}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="h-full rounded-full bg-success transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(repository.healthScore, 0),
                      100,
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* Debt bar */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs text-body">
                  Technical debt
                </span>

                <span className="font-mono text-xs text-warning">
                  {repository.technicalDebtPercent}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="h-full rounded-full bg-warning transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(repository.technicalDebtPercent, 0),
                      100,
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* Status information */}

            <div className="grid grid-cols-2 gap-3 pt-1">

              <div
                className="
                  rounded-xl
                  border border-border
                  bg-surface-raised/40
                  p-3
                "
              >

                <div className="flex items-center gap-2 mb-1">

                  <GitBranch
                    size={12}
                    className="text-accent-light"
                  />

                  <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                    Branch
                  </span>

                </div>

                <div className="text-xs font-mono text-heading truncate">
                  {repository.branch || repository.defaultBranch || 'main'}
                </div>

              </div>


              <div
                className="
                  rounded-xl
                  border border-border
                  bg-surface-raised/40
                  p-3
                "
              >

                <div className="flex items-center gap-2 mb-1">

                  <ShieldCheck
                    size={12}
                    className="text-success"
                  />

                  <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                    Status
                  </span>

                </div>

                <div className="text-xs text-success font-medium capitalize">
                  {repository.status}
                </div>

              </div>

            </div>

          </div>

        </Card>

      </div>


      {/* ─────────────────────────────────────────────
          METRIC GRID
      ───────────────────────────────────────────── */}

      <div>

        <div className="flex items-center gap-2 mb-3">

          <Activity
            size={13}
            className="text-muted"
          />

          <span
            className="
              text-[10px]
              uppercase
              tracking-wider
              font-semibold
              text-muted
            "
          >
            Analysis Metrics
          </span>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="
                  p-4
                  group
                  transition-all duration-200
                  hover:border-accent/30
                  hover:bg-surface-raised/30
                "
              >

                <div className="flex items-center justify-between">

                  <div
                    className="
                      size-8 rounded-lg
                      bg-accent/10
                      flex items-center justify-center
                      transition-transform duration-200
                      group-hover:scale-105
                    "
                  >
                    <Icon
                      size={14}
                      className="text-accent-light"
                    />
                  </div>

                </div>

                <div
                  className="
                    mt-3
                    font-mono
                    text-xl
                    text-heading
                    font-semibold
                    truncate
                  "
                >
                  {stat.value}
                </div>

                <div className="text-xs text-body mt-0.5 truncate">
                  {stat.label}
                </div>

                <div className="text-[10px] text-muted mt-1 truncate">
                  {stat.description}
                </div>

              </Card>
            );
          })}

        </div>

      </div>


      {/* ─────────────────────────────────────────────
          LANGUAGE BREAKDOWN
      ───────────────────────────────────────────── */}

      {repository.languages.length > 0 && (

        <Card className="overflow-hidden">

          <div
            className="
              px-5 py-4
              border-b border-border
              flex items-center justify-between
              gap-4
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <div
                  className="
                    size-7 rounded-md
                    bg-accent/10
                    flex items-center justify-center
                  "
                >
                  <Code2
                    size={14}
                    className="text-accent-light"
                  />
                </div>

                <h3 className="text-heading font-semibold text-sm">
                  Language Breakdown
                </h3>

              </div>

              <p className="text-muted text-xs mt-1 ml-9">
                Distribution based on analyzed lines of code.
              </p>

            </div>

            <span className="text-[10px] text-muted font-mono">
              {repository.languages.length} languages
            </span>

          </div>


          <div className="p-5">

            {/* Segmented overview */}

            <div className="h-3 rounded-full bg-surface-raised overflow-hidden flex mb-6">

              {repository.languages.map((language) => (

                <div
                  key={language.language}
                  className="h-full bg-accent first:opacity-100 opacity-70 border-r border-surface"
                  style={{
                    width: `${Math.max(
                      language.percent,
                      language.percent > 0 ? 1 : 0,
                    )}%`,
                  }}
                  title={`${language.language}: ${language.percent}%`}
                />

              ))}

            </div>


            {/* Language rows */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

              {repository.languages.map((language, index) => (

                <div key={language.language}>

                  <div className="flex items-center justify-between mb-1.5">

                    <div className="flex items-center gap-2 min-w-0">

                      <span
                        className="
                          size-2
                          rounded-full
                          bg-accent
                          shrink-0
                        "
                      />

                      <span className="text-xs text-body truncate">
                        {language.language}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 shrink-0">

                      <span className="text-[10px] text-muted font-mono">
                        {language.linesOfCode.toLocaleString()} LOC
                      </span>

                      <span className="text-xs font-mono text-heading font-medium w-10 text-right">
                        {language.percent}%
                      </span>

                    </div>

                  </div>

                  <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-accent
                        transition-all duration-700
                      "
                      style={{
                        width: `${Math.min(
                          Math.max(language.percent, 0),
                          100,
                        )}%`,
                        opacity: Math.max(
                          0.45,
                          1 - index * 0.08,
                        ),
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </Card>

      )}


      {/* ─────────────────────────────────────────────
          ANALYSIS INFO
      ───────────────────────────────────────────── */}

      <div
        className="
          flex items-start gap-3
          rounded-xl
          border border-border
          bg-surface-raised/30
          px-4 py-3
        "
      >

        <TrendingUp
          size={14}
          className="text-muted shrink-0 mt-0.5"
        />

        <div>

          <p className="text-xs text-body font-medium">
            Health score is based on the current analysis
          </p>

          <p className="text-[11px] text-muted mt-1 leading-5">
            The score reflects the analyzer's current repository-level
            findings and metrics. It is not a historical trend and does
            not represent independent per-dimension scores.
          </p>

        </div>

      </div>

    </div>
  );
}