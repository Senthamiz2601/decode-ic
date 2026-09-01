import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  Layers3,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  Wrench,
} from 'lucide-react';

import { Card, Badge, RiskBadge, Button } from '@/components/primitives';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/states';

import { getTechnicalDebt } from '@/services/technicalDebtService';

import type {
  TechnicalDebtFinding,
  TechnicalDebtCategoryCount,
} from '@/services/technicalDebtService';

export default function TechnicalDebt() {
  const { id } = useParams();

  const [percent, setPercent] = useState(0);
  const [byCategory, setByCategory] = useState<
    TechnicalDebtCategoryCount[]
  >([]);
  const [issues, setIssues] = useState<TechnicalDebtFinding[]>([]);

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

      const result = await getTechnicalDebt(id);

      if (!result?.ok) {
        throw new Error(
          result?.message || 'Failed to load technical debt',
        );
      }

      setPercent(result.technicalDebtPercent || 0);
      setByCategory(result.byCategory || []);
      setIssues(result.issues || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load technical debt',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryData = useMemo(
    () =>
      byCategory
        .map((category) => ({
          label: category.category,
          count: category.count,
        }))
        .sort((a, b) => b.count - a.count),
    [byCategory],
  );

  const totalFindings = issues.length;

  const highSeverity = issues.filter(
    (issue) =>
      issue.severity === 'high' ||
      issue.severity === 'critical',
  ).length;

  const mediumSeverity = issues.filter(
    (issue) => issue.severity === 'medium',
  ).length;

  const lowSeverity = issues.filter(
    (issue) => issue.severity === 'low',
  ).length;

  const healthLabel =
    percent === 0
      ? 'Excellent'
      : percent < 5
        ? 'Healthy'
        : percent < 15
          ? 'Needs attention'
          : 'High debt';

  const healthIcon =
    percent === 0 ? (
      <CheckCircle2 size={17} />
    ) : (
      <TrendingDown size={17} />
    );

  if (loading) {
    return <LoadingState label="Loading technical debt…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load technical debt"
        reasons={[error]}
        onRetry={load}
      />
    );
  }

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
              from-warning/20
              to-orange-500/5
              border border-warning/20
              flex items-center justify-center
              shadow-[0_0_25px_rgba(245,158,11,0.08)]
            "
          >
            <Wrench
              size={20}
              className="text-warning"
            />
          </div>

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <h1 className="text-heading text-2xl font-semibold">
                Technical Debt
              </h1>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-warning/20
                  bg-warning/5
                  px-2 py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-warning
                "
              >
                <span className="size-1.5 rounded-full bg-warning" />
                Code Quality
              </span>

            </div>

            <p className="text-muted text-sm mt-1">
              Identify maintainability issues and prioritize areas
              that need engineering attention.
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
          OVERVIEW
      ───────────────────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">

        {/* Debt score */}

        <Card
          className="
            relative overflow-hidden
            p-6
            border-border/80
            bg-surface
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-16
              size-40
              rounded-full
              bg-warning/5
              blur-3xl
            "
          />

          <div className="relative">

            <div className="flex items-start justify-between gap-4">

              <div>

                <div
                  className="
                    flex items-center gap-2
                    text-[10px]
                    uppercase
                    tracking-wider
                    font-semibold
                    text-muted
                  "
                >
                  <ShieldAlert size={12} />
                  Debt exposure
                </div>

                <div className="flex items-end gap-3 mt-3">

                  <span
                    className="
                      text-5xl
                      font-mono
                      font-semibold
                      tracking-tight
                      text-warning
                    "
                  >
                    {percent}%
                  </span>

                  <span className="text-muted text-sm mb-2">
                    of analyzed code
                  </span>

                </div>

                <div className="flex items-center gap-2 mt-3">

                  <span
                    className="
                      inline-flex items-center gap-1.5
                      text-xs
                      font-medium
                      text-body
                    "
                  >
                    {healthIcon}
                    {healthLabel}
                  </span>

                  <span className="text-muted text-xs">
                    · {totalFindings} findings detected
                  </span>

                </div>

              </div>


              {/* Circular-ish visual */}

              <div className="hidden sm:flex relative size-24 items-center justify-center">

                <div
                  className="
                    absolute inset-0
                    rounded-full
                    border-[7px]
                    border-border
                  "
                />

                <div
                  className="
                    absolute inset-0
                    rounded-full
                    border-[7px]
                    border-warning
                    opacity-80
                  "
                  style={{
                    clipPath:
                      `inset(${Math.max(
                        0,
                        100 - Math.min(percent * 4, 100),
                      )}% 0 0 0)`,
                  }}
                />

                <div className="text-center">

                  <div className="text-heading font-mono text-sm font-semibold">
                    {Math.max(0, 100 - percent)}
                  </div>

                  <div className="text-[9px] text-muted uppercase tracking-wider">
                    score
                  </div>

                </div>

              </div>

            </div>


            {/* Progress */}

            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                  Debt level
                </span>

                <span className="text-[10px] text-muted font-mono">
                  {percent} / 100
                </span>

              </div>

              <div className="h-2 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-warning
                    transition-all duration-700
                  "
                  style={{
                    width: `${Math.min(percent, 100)}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </Card>


        {/* Severity summary */}

        <Card className="p-6">

          <div className="flex items-center gap-2 mb-5">

            <AlertTriangle
              size={14}
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
              Finding severity
            </span>

          </div>

          <div className="space-y-4">

            {/* High */}

            <div>

              <div className="flex items-center justify-between mb-1.5">

                <span className="text-xs text-body">
                  High / Critical
                </span>

                <span className="font-mono text-xs text-danger font-semibold">
                  {highSeverity}
                </span>

              </div>

              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="h-full rounded-full bg-danger"
                  style={{
                    width:
                      totalFindings > 0
                        ? `${(highSeverity / totalFindings) * 100}%`
                        : '0%',
                  }}
                />

              </div>

            </div>


            {/* Medium */}

            <div>

              <div className="flex items-center justify-between mb-1.5">

                <span className="text-xs text-body">
                  Medium
                </span>

                <span className="font-mono text-xs text-warning font-semibold">
                  {mediumSeverity}
                </span>

              </div>

              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="h-full rounded-full bg-warning"
                  style={{
                    width:
                      totalFindings > 0
                        ? `${(mediumSeverity / totalFindings) * 100}%`
                        : '0%',
                  }}
                />

              </div>

            </div>


            {/* Low */}

            <div>

              <div className="flex items-center justify-between mb-1.5">

                <span className="text-xs text-body">
                  Low
                </span>

                <span className="font-mono text-xs text-success font-semibold">
                  {lowSeverity}
                </span>

              </div>

              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">

                <div
                  className="h-full rounded-full bg-success"
                  style={{
                    width:
                      totalFindings > 0
                        ? `${(lowSeverity / totalFindings) * 100}%`
                        : '0%',
                  }}
                />

              </div>

            </div>

          </div>

        </Card>

      </div>


      {/* ─────────────────────────────────────────────
          QUICK STATS
      ───────────────────────────────────────────── */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <Card className="p-4">

          <div className="flex items-center justify-between">

            <div
              className="
                size-8 rounded-lg
                bg-accent/10
                flex items-center justify-center
              "
            >
              <AlertTriangle
                size={14}
                className="text-accent-light"
              />
            </div>

            <span className="text-[10px] text-muted uppercase tracking-wider">
              Total
            </span>

          </div>

          <div className="mt-3 font-mono text-2xl text-heading font-semibold">
            {totalFindings}
          </div>

          <div className="text-xs text-muted mt-0.5">
            Debt findings
          </div>

        </Card>


        <Card className="p-4">

          <div className="flex items-center justify-between">

            <div
              className="
                size-8 rounded-lg
                bg-danger/10
                flex items-center justify-center
              "
            >
              <ShieldAlert
                size={14}
                className="text-danger"
              />
            </div>

            <span className="text-[10px] text-muted uppercase tracking-wider">
              Priority
            </span>

          </div>

          <div className="mt-3 font-mono text-2xl text-danger font-semibold">
            {highSeverity}
          </div>

          <div className="text-xs text-muted mt-0.5">
            High severity
          </div>

        </Card>


        <Card className="p-4">

          <div className="flex items-center justify-between">

            <div
              className="
                size-8 rounded-lg
                bg-warning/10
                flex items-center justify-center
              "
            >
              <Layers3
                size={14}
                className="text-warning"
              />
            </div>

            <span className="text-[10px] text-muted uppercase tracking-wider">
              Categories
            </span>

          </div>

          <div className="mt-3 font-mono text-2xl text-heading font-semibold">
            {byCategory.length}
          </div>

          <div className="text-xs text-muted mt-0.5">
            Debt categories
          </div>

        </Card>


        <Card className="p-4">

          <div className="flex items-center justify-between">

            <div
              className="
                size-8 rounded-lg
                bg-success/10
                flex items-center justify-center
              "
            >
              <CheckCircle2
                size={14}
                className="text-success"
              />
            </div>

            <span className="text-[10px] text-muted uppercase tracking-wider">
              Score
            </span>

          </div>

          <div className="mt-3 font-mono text-2xl text-success font-semibold">
            {Math.max(0, 100 - percent)}
          </div>

          <div className="text-xs text-muted mt-0.5">
            Maintainability score
          </div>

        </Card>

      </div>


      {/* ─────────────────────────────────────────────
          CATEGORY ANALYSIS
      ───────────────────────────────────────────── */}

      {categoryData.length > 0 && (

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
                  <Layers3
                    size={14}
                    className="text-accent-light"
                  />
                </div>

                <h3 className="text-heading font-semibold text-sm">
                  Debt by Category
                </h3>

              </div>

              <p className="text-muted text-xs mt-1 ml-9">
                Distribution of detected technical-debt findings.
              </p>

            </div>

            <span className="text-[10px] text-muted font-mono">
              {categoryData.length} categories
            </span>

          </div>


          <div className="p-5">

            <ResponsiveContainer
              width="100%"
              height={Math.max(
                230,
                categoryData.length * 44,
              )}
            >

              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{
                  left: 10,
                  right: 20,
                  top: 5,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.08}
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  stroke="currentColor"
                  opacity={0.45}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="currentColor"
                  opacity={0.6}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />

                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{
                    fill: 'rgba(99,102,241,0.05)',
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="currentColor"
                  opacity={0.8}
                  radius={[0, 5, 5, 0]}
                  barSize={20}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      )}


      {/* ─────────────────────────────────────────────
          FINDINGS
      ───────────────────────────────────────────── */}

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
                  bg-warning/10
                  flex items-center justify-center
                "
              >
                <FileCode2
                  size={14}
                  className="text-warning"
                />
              </div>

              <h3 className="text-heading font-semibold text-sm">
                Technical Debt Findings
              </h3>

            </div>

            <p className="text-muted text-xs mt-1 ml-9">
              Issues detected during repository analysis.
            </p>

          </div>

          <span
            className="
              rounded-full
              border border-border
              bg-surface-raised
              px-2.5 py-1
              text-[10px]
              font-mono
              text-muted
            "
          >
            {issues.length} findings
          </span>

        </div>


        {issues.length === 0 ? (

          <div className="p-5">

            <EmptyState
              icon={CheckCircle2}
              title="No technical debt findings"
              description="
                The analyzer did not flag any technical-debt-related
                findings for this repository.
              "
            />

          </div>

        ) : (

          <div className="divide-y divide-border">

            {issues.map((issue, index) => (

              <div
                key={issue.id}
                className="
                  group
                  p-5
                  transition-colors duration-200
                  hover:bg-surface-raised/30
                "
              >

                <div className="flex items-start gap-4">

                  {/* Number */}

                  <div
                    className="
                      hidden sm:flex
                      size-8 shrink-0
                      rounded-lg
                      border border-border
                      bg-surface-raised
                      items-center justify-center
                      font-mono
                      text-[10px]
                      text-muted
                    "
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>


                  <div className="min-w-0 flex-1">

                    {/* Title row */}

                    <div
                      className="
                        flex items-center
                        gap-2
                        flex-wrap
                        mb-1.5
                      "
                    >

                      <span className="text-heading text-sm font-semibold">
                        {issue.title}
                      </span>

                      <RiskBadge level={issue.severity} />

                    </div>


                    {/* Description */}

                    <p
                      className="
                        text-muted
                        text-xs
                        leading-5
                        max-w-4xl
                      "
                    >
                      {issue.description}
                    </p>


                    {/* Metadata */}

                    <div
                      className="
                        flex items-center
                        gap-2
                        flex-wrap
                        mt-3
                      "
                    >

                      <Badge>
                        {issue.category}
                      </Badge>

                      {issue.file && (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            max-w-full
                            rounded-md
                            border border-border
                            bg-surface-raised
                            px-2 py-1
                            text-[10px]
                            font-mono
                            text-accent-light
                            truncate
                          "
                        >

                          <FileCode2 size={11} />

                          {issue.file}

                        </span>

                      )}

                      {issue.line != null && (

                        <span
                          className="
                            rounded-md
                            border border-border
                            bg-surface-raised
                            px-2 py-1
                            text-[10px]
                            font-mono
                            text-muted
                          "
                        >
                          Line {issue.line}
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </Card>


      {/* ─────────────────────────────────────────────
          FOOTER NOTE
      ───────────────────────────────────────────── */}

      {issues.length > 0 && (

        <div
          className="
            flex items-start gap-3
            rounded-xl
            border border-border
            bg-surface-raised/30
            px-4 py-3
          "
        >

          <AlertTriangle
            size={14}
            className="text-muted shrink-0 mt-0.5"
          />

          <p className="text-[11px] text-muted leading-5">
            Technical-debt metrics are derived from the current
            repository analysis. Re-run analysis after significant
            code changes to keep these findings up to date.
          </p>

        </div>

      )}

    </div>
  );
}