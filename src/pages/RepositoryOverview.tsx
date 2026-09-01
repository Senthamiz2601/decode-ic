import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  GitBranch,
  Star,
  Clock,
  RefreshCw,
  Loader2,
  FileCode2,
  Braces,
  Boxes,
  Waypoints,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Network,
  Package,
  Code2,
  Sparkles,
  GitCompareArrows,
  Wand2,
  FileBarChart,
  ChevronRight,
} from 'lucide-react';

import {
  Card,
  RiskBadge,
  Button,
} from '@/components/primitives';

import {
  HealthScore,
  ChartCard,
} from '@/components/data-display';

import {
  getRepository,
  reanalyzeRepository,
} from '@/services/repositoryService';

const langColors = [
  '#3b82f6',
  '#4edea3',
  '#facc15',
  '#ffb4ab',
  '#adc6ff',
];

type Repository = {
  id: string;
  name: string;
  fullName?: string;
  owner: string;
  description: string | null;
  language: string | null;
  defaultBranch: string;

  stars: number;
  private: boolean;

  fileCount: number;
  linesOfCode: number;
  dependencyCount: number;
  componentCount: number;
  apiEndpointCount: number;

  healthScore: number;
  technicalDebtPercent: number;
  riskLevel: 'low' | 'medium' | 'high';

  lastAnalyzed: string;
  status: string;
  branch: string;

  languages?: {
    language: string;
    percent: number;
    linesOfCode?: number;
  }[];

  analysis?: {
    findings?: {
      id: string;
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      file?: string | null;
      line?: number | null;
    }[];

    analyzedAt?: string;
    analyzedFiles?: number;
    treeTruncated?: boolean;
  } | null;
};

type MetricVisualProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: 'blue' | 'purple' | 'green' | 'orange';
};

function MetricVisualCard({
  label,
  value,
  description,
  icon,
  accent,
}: MetricVisualProps) {
  const styles = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-400 border-blue-400/10',
      glow: 'from-blue-500/10 via-blue-500/0',
      hover: 'hover:border-blue-400/30',
      line: 'bg-blue-400',
    },
    purple: {
      icon: 'bg-violet-500/10 text-violet-400 border-violet-400/10',
      glow: 'from-violet-500/10 via-violet-500/0',
      hover: 'hover:border-violet-400/30',
      line: 'bg-violet-400',
    },
    green: {
      icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/10',
      glow: 'from-emerald-500/10 via-emerald-500/0',
      hover: 'hover:border-emerald-400/30',
      line: 'bg-emerald-400',
    },
    orange: {
      icon: 'bg-orange-500/10 text-orange-400 border-orange-400/10',
      glow: 'from-orange-500/10 via-orange-500/0',
      hover: 'hover:border-orange-400/30',
      line: 'bg-orange-400',
    },
  };

  const theme = styles[accent];

  return (
    <Card
      className={`
        group relative overflow-hidden p-5
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${theme.hover}
      `}
    >
      {/* Decorative gradient */}
      <div
        className={`
          absolute inset-0 opacity-0
          bg-gradient-to-br ${theme.glow} to-transparent
          transition-opacity duration-300
          group-hover:opacity-100
        `}
      />

      {/* Decorative circle */}
      <div
        className="
          absolute -right-8 -top-8
          h-24 w-24 rounded-full
          border border-white/[0.04]
        "
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className={`
              flex h-11 w-11 items-center justify-center
              rounded-xl border
              transition-transform duration-300
              group-hover:scale-110 group-hover:rotate-3
              ${theme.icon}
            `}
          >
            {icon}
          </div>

          <ArrowUpRight
            size={16}
            className="
              text-muted opacity-0
              transition-all duration-300
              group-hover:opacity-100
              group-hover:translate-x-0.5 group-hover:-translate-y-0.5
            "
          />

        </div>

        <div className="mt-5">

          <div className="text-3xl font-semibold tracking-tight text-heading">
            {value}
          </div>

          <div className="mt-1 text-sm font-medium text-body">
            {label}
          </div>

          <p className="mt-1 text-xs text-muted">
            {description}
          </p>

        </div>

        {/* Bottom accent line */}
        <div className="mt-4 h-px w-full bg-border overflow-hidden">
          <div
            className={`
              h-full w-0
              transition-all duration-500
              group-hover:w-full
              ${theme.line}
            `}
          />
        </div>

      </div>
    </Card>
  );
}

export default function RepositoryOverview() {
  const { id } = useParams();

  const [repo, setRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepository = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getRepository(id);

      if (!result?.ok) {
        throw new Error(
          result?.message || 'Repository not found'
        );
      }

      setRepo(result.repository);
    } catch (error) {
      console.error('Repository overview error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load repository'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepository();
  }, [id]);

  const handleReanalyze = async () => {
    if (!id || reanalyzing) return;

    try {
      setReanalyzing(true);
      setError(null);

      const result = await reanalyzeRepository(id);

      if (!result || result.ok !== true) {
        throw new Error(
          'Failed to re-analyze repository'
        );
      }

      await loadRepository();
    } catch (error) {
      console.error(
        'Repository re-analysis error:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to re-analyze repository'
      );
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">

            <div className="absolute inset-0 animate-ping rounded-full bg-accent/10" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <Loader2
                size={22}
                className="animate-spin text-accent"
              />
            </div>

          </div>

          <p className="text-heading text-sm font-medium">
            Loading repository intelligence
          </p>

          <p className="mt-1 text-xs text-muted">
            Fetching analysis data…
          </p>

        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10">
          <AlertTriangle
            size={24}
            className="text-danger"
          />
        </div>

        <h2 className="text-heading text-xl font-semibold">
          Repository not found
        </h2>

        <p className="mt-2 text-sm text-muted">
          {error || 'This repository is not connected.'}
        </p>

        <Link
          to="/repositories"
          className="mt-5 inline-flex items-center gap-2 text-sm text-accent-light hover:underline"
        >
          ← Back to repositories
        </Link>

      </div>
    );
  }

  const analysisCompleted =
    repo.status === 'complete' ||
    repo.status === 'completed' ||
    Boolean(repo.analysis) ||
    repo.lastAnalyzed !== 'Not analyzed';

  const analysisInProgress =
    repo.status === 'analyzing' || reanalyzing;

  const languages =
    repo.languages && repo.languages.length > 0
      ? repo.languages
      : repo.language
        ? [
            {
              language: repo.language,
              percent: 100,
            },
          ]
        : [];

  const findings = repo.analysis?.findings || [];

  const topRisks = [...findings]
    .sort((a, b) => {
      const severityWeight = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };

      return (
        severityWeight[b.severity] -
        severityWeight[a.severity]
      );
    })
    .slice(0, 3);

  const navigationItems = [
    {
      label: 'Architecture',
      description: 'Explore system structure',
      icon: Network,
      to: `/repositories/${repo.id}/architecture`,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Dependencies',
      description: 'Inspect package relationships',
      icon: Package,
      to: `/repositories/${repo.id}/dependencies`,
      color: 'text-violet-400 bg-violet-500/10',
    },
    {
      label: 'Code Explorer',
      description: 'Browse repository code',
      icon: Code2,
      to: `/repositories/${repo.id}/code`,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      label: 'AI Assistant',
      description: 'Ask about your codebase',
      icon: Sparkles,
      to: `/repositories/${repo.id}/ai`,
      color: 'text-fuchsia-400 bg-fuchsia-500/10',
    },
    {
      label: 'Impact Analysis',
      description: 'Understand code changes',
      icon: GitCompareArrows,
      to: `/repositories/${repo.id}/impact`,
      color: 'text-orange-400 bg-orange-500/10',
    },
    {
      label: 'Change Simulation',
      description: 'Test potential changes',
      icon: Activity,
      to: `/repositories/${repo.id}/simulate`,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'AI Refactoring',
      description: 'Improve your code',
      icon: Wand2,
      to: `/repositories/${repo.id}/refactoring`,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      label: 'Reports',
      description: 'Export repository insights',
      icon: FileBarChart,
      to: '/reports',
      color: 'text-yellow-400 bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-7">

      {/* HEADER */}

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6">

        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-start justify-between gap-6">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                <GitBranch size={17} />
              </div>

              <span className="text-xs font-medium text-muted">
                Repository Intelligence
              </span>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-heading text-2xl font-semibold tracking-tight">
                {repo.name}
              </h1>

              <RiskBadge level={repo.riskLevel} />

            </div>

            <p className="mt-2 max-w-2xl text-sm text-muted">
              {repo.description ||
                'No repository description available.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">

              <span className="flex items-center gap-1.5">
                <GitBranch size={13} />
                {repo.branch || repo.defaultBranch}
              </span>

              <span className="flex items-center gap-1.5">
                <Star size={13} />
                {repo.stars} stars
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {repo.lastAnalyzed}
              </span>

            </div>

          </div>

          <Button
            variant="secondary"
            onClick={handleReanalyze}
            disabled={analysisInProgress}
          >
            {analysisInProgress ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={15} />
            )}

            {analysisInProgress
              ? 'Analyzing...'
              : 'Re-analyze'}

          </Button>

        </div>
      </div>


      {/* INTELLIGENCE METRICS */}

      <div>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <h2 className="text-heading text-sm font-semibold">
              Repository Intelligence
            </h2>

            <p className="mt-1 text-xs text-muted">
              Key metrics from the latest repository scan
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Analysis data active
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricVisualCard
            label="Files Analyzed"
            value={repo.fileCount.toLocaleString()}
            description="Repository structure scanned"
            icon={<FileCode2 size={21} />}
            accent="blue"
          />

          <MetricVisualCard
            label="Lines of Code"
            value={repo.linesOfCode.toLocaleString()}
            description="Across detected source files"
            icon={<Braces size={21} />}
            accent="purple"
          />

          <MetricVisualCard
            label="Dependencies"
            value={String(repo.dependencyCount)}
            description="Package relationships detected"
            icon={<Boxes size={21} />}
            accent="green"
          />

          <MetricVisualCard
            label="API Endpoints"
            value={String(repo.apiEndpointCount)}
            description="Application surface discovered"
            icon={<Waypoints size={21} />}
            accent="orange"
          />

        </div>

      </div>


      {/* HEALTH / LANGUAGE / DEBT */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* CODE HEALTH */}

        <Card className="group relative overflow-hidden p-6">

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-2xl" />

          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Code Health
                </p>

                <p className="mt-1 text-xs text-muted">
                  Overall repository quality
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={18} />
              </div>

            </div>

            <div className="flex justify-center py-2">

              <HealthScore
                score={repo.healthScore}
                size={120}
              />

            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              {analysisCompleted
                ? 'Based on latest repository scan'
                : 'Waiting for analysis'}

            </div>

          </div>

        </Card>


        {/* LANGUAGE DISTRIBUTION */}

        <ChartCard title="Language Distribution">

          {languages.length > 0 ? (
            <>

              <ResponsiveContainer
                width="100%"
                height={180}
              >

                <PieChart>

                  <Pie
                    data={languages}
                    dataKey="percent"
                    nameKey="language"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    stroke="transparent"
                  >

                    {languages.map((language, index) => (

                      <Cell
                        key={language.language}
                        fill={
                          langColors[
                            index % langColors.length
                          ]
                        }
                      />

                    ))}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

              <div className="mt-3 grid grid-cols-2 gap-2">

                {languages.map((language, index) => (

                  <div
                    key={language.language}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-2.5 py-2 text-xs"
                  >

                    <div className="flex items-center gap-2 min-w-0">

                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background:
                            langColors[
                              index % langColors.length
                            ],
                        }}
                      />

                      <span className="truncate text-muted">
                        {language.language}
                      </span>

                    </div>

                    <span className="font-medium text-heading">
                      {language.percent}%
                    </span>

                  </div>

                ))}

              </div>

            </>
          ) : (

            <div className="flex h-[220px] flex-col items-center justify-center text-center">

              <Code2
                size={26}
                className="mb-3 text-muted/50"
              />

              <p className="text-sm text-muted">
                Language information unavailable
              </p>

            </div>

          )}

        </ChartCard>


        {/* TECHNICAL DEBT */}

        <Card className="relative overflow-hidden p-6">

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/[0.04] blur-2xl" />

          <div className="relative">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Technical Debt
                </p>

                <p className="mt-1 text-xs text-muted">
                  Maintainability signals
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <AlertTriangle size={18} />
              </div>

            </div>

            <div className="mb-4 flex items-end gap-2">

              <span className="font-mono text-4xl font-semibold tracking-tight text-warning">
                {repo.technicalDebtPercent}%
              </span>

              <span className="mb-1 text-xs text-muted">
                flagged
              </span>

            </div>

            {/* Progress bar */}

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-border">

              <div
                className="h-full rounded-full bg-warning transition-all duration-700"
                style={{
                  width: `${Math.min(
                    repo.technicalDebtPercent,
                    100,
                  )}%`,
                }}
              />

            </div>

            {analysisInProgress ? (

              <div className="flex items-center gap-2 text-xs text-muted">

                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Analysis in progress...

              </div>

            ) : analysisCompleted ? (

              <p className="text-xs leading-relaxed text-muted">
                Technical debt analysis completed from the
                latest repository scan.
              </p>

            ) : (

              <p className="text-xs text-muted">
                Analysis has not been completed yet.
              </p>

            )}

            <Link
              to={`/repositories/${repo.id}/technical-debt`}
              className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-accent-light hover:underline"
            >

              View full breakdown

              <ChevronRight size={13} />

            </Link>

          </div>

        </Card>

      </div>


      {/* TOP RISKS */}

      <Card className="overflow-hidden">

        <div className="flex items-center justify-between border-b border-border bg-surface-raised/30 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <AlertTriangle size={17} />
            </div>

            <div>

              <h3 className="text-sm font-semibold text-heading">
                Top Risk Findings
              </h3>

              <p className="mt-0.5 text-xs text-muted">
                Highest priority signals from analysis
              </p>

            </div>

          </div>

          <Link
            to={`/repositories/${repo.id}/risks`}
            className="hidden items-center gap-1 text-sm text-accent-light hover:underline sm:flex"
          >
            View Risk Center
            <ArrowUpRight size={14} />
          </Link>

        </div>


        <div className="p-5">

          {analysisInProgress ? (

            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-raised/20 py-10">

              <Loader2
                size={18}
                className="animate-spin text-accent"
              />

              <span className="text-sm text-muted">
                Analyzing repository risks...
              </span>

            </div>

          ) : !analysisCompleted ? (

            <div className="rounded-xl border border-dashed border-border p-8 text-center">

              <Activity
                size={24}
                className="mx-auto mb-3 text-muted/50"
              />

              <p className="text-sm text-muted">
                Repository analysis has not been completed yet.
              </p>

            </div>

          ) : topRisks.length > 0 ? (

            <div className="space-y-3">

              {topRisks.map((finding, index) => (

                <div
                  key={finding.id}
                  className="
                    group relative overflow-hidden
                    rounded-xl border border-border
                    p-4 transition-all duration-200
                    hover:border-accent/30 hover:bg-surface-raised/30
                  "
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-xs font-semibold text-danger">

                      {String(index + 1).padStart(2, '0')}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <span className="text-sm font-medium text-heading">
                          {finding.title}
                        </span>

                        <RiskBadge level={finding.severity} />

                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-muted">
                        {finding.description}
                      </p>

                      {(finding.file || finding.line) && (

                        <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-surface-raised px-2 py-1 font-mono text-[11px] text-muted">

                          <FileCode2 size={11} />

                          {finding.file || 'Repository'}

                          {finding.line
                            ? `:${finding.line}`
                            : ''}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="flex items-start gap-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">

                <ShieldCheck size={20} />

              </div>

              <div>

                <div className="mb-2 flex items-center gap-3">

                  <span className="text-sm font-medium text-heading">
                    No significant risks detected
                  </span>

                  <RiskBadge level={repo.riskLevel} />

                </div>

                <p className="text-xs leading-relaxed text-muted">

                  Analysis completed successfully. The current
                  deterministic analyzer did not identify any
                  specific risk findings.

                </p>

              </div>

            </div>

          )}

        </div>

      </Card>


      {/* EXPLORE REPOSITORY */}

      <div>

        <div className="mb-4">

          <h2 className="text-sm font-semibold text-heading">
            Explore Repository
          </h2>

          <p className="mt-1 text-xs text-muted">
            Dive deeper into different areas of your codebase
          </p>

        </div>


        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {navigationItems.map((item) => {

            const Icon = item.icon;

            return (

              <Link
                key={item.label}
                to={item.to}
                className="
                  group relative overflow-hidden
                  rounded-xl border border-border
                  bg-surface p-4
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-accent/30
                  hover:bg-surface-raised/40
                  hover:shadow-lg
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center
                      rounded-lg transition-transform duration-200
                      group-hover:scale-110
                      ${item.color}
                    `}
                  >

                    <Icon size={18} />

                  </div>

                  <ArrowUpRight
                    size={15}
                    className="
                      text-muted opacity-0
                      transition-all duration-200
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                      group-hover:opacity-100
                    "
                  />

                </div>

                <div className="mt-5">

                  <div className="text-sm font-medium text-heading">

                    {item.label}

                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-muted">

                    {item.description}

                  </p>

                </div>

              </Link>

            );

          })}

        </div>

      </div>

    </div>
  );
}
