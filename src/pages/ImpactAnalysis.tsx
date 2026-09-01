import React, { useState } from 'react';
import {
  Search,
  GitBranch,
  Layers3,
  Boxes,
  Globe2,
  Database,
  FlaskConical,
  ArrowRight,
  Network,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

import { Card, Input, Button, Select } from '@/components/primitives';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import { runImpactAnalysis } from '@/services/impactService';
import type { ImpactAnalysis } from '@/types';

export default function ImpactAnalysisPage() {
  const [target, setTarget] = useState('updateUserProfile()');
  const [targetType, setTargetType] = useState('function');
  const [result, setResult] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!target.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const r = await runImpactAnalysis(target.trim());
      setResult(r);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze change impact',
      );
    } finally {
      setLoading(false);
    }
  }

  const score = result?.impactScore ?? 0;

  const scoreLabel =
    score >= 80
      ? 'Critical impact'
      : score >= 60
        ? 'High impact'
        : score >= 35
          ? 'Moderate impact'
          : 'Low impact';

  const scoreIcon =
    score >= 60 ? AlertTriangle : CheckCircle2;

  const ScoreIcon = scoreIcon;

  const sections = result
    ? [
        {
          title: 'Direct Dependencies',
          description: 'Immediate dependencies affected by this change.',
          icon: GitBranch,
          items: result.directDependencies,
        },
        {
          title: 'Indirect Dependencies',
          description: 'Downstream services and modules that may be affected.',
          icon: Network,
          items: result.indirectDependencies,
        },
        {
          title: 'Affected Components',
          description: 'Frontend components within the change radius.',
          icon: Boxes,
          items: result.affectedComponents,
        },
        {
          title: 'Affected APIs',
          description: 'API endpoints connected to the target.',
          icon: Globe2,
          items: result.affectedApis,
        },
        {
          title: 'Database Operations',
          description: 'Database interactions potentially impacted.',
          icon: Database,
          items: result.databaseOperations,
        },
        {
          title: 'Potential Tests',
          description: 'Tests that should be reviewed before shipping.',
          icon: FlaskConical,
          items: result.relatedTests,
        },
      ]
    : [];

  return (
    <div className="space-y-7">

      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full
                border border-accent/20
                bg-accent/5
                px-2.5 py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-accent-light
              "
            >
              <Network size={11} />
              Code Intelligence
            </span>
          </div>

          <h1 className="text-heading text-2xl sm:text-3xl font-semibold tracking-tight">
            Change Impact Analysis
          </h1>

          <p className="text-muted text-sm mt-1.5 max-w-2xl leading-relaxed">
            Trace the blast radius of a change across dependencies,
            components, APIs, database operations, and related tests.
          </p>
        </div>

        {result && (
          <div
            className="
              hidden sm:flex
              items-center gap-2
              rounded-lg
              border border-border
              bg-surface-raised/50
              px-3 py-2
              text-xs text-muted
            "
          >
            <CheckCircle2 size={13} className="text-success" />
            Analysis complete
          </div>
        )}

      </div>


      {/* ─────────────────────────────────────────────
          ANALYSIS INPUT
      ───────────────────────────────────────────── */}

      <Card
        className="
          overflow-hidden
          border-border/80
          bg-surface
          shadow-[0_8px_40px_rgba(0,0,0,0.10)]
        "
      >

        <div
          className="
            px-5 py-4
            border-b border-border
            bg-surface-raised/35
            flex items-center gap-2
          "
        >
          <div
            className="
              size-7 rounded-md
              bg-accent/10
              border border-accent/20
              flex items-center justify-center
            "
          >
            <Search size={13} className="text-accent-light" />
          </div>

          <div>
            <div className="text-xs font-semibold text-heading">
              Select change target
            </div>
            <div className="text-[10px] text-muted mt-0.5">
              Identify the code element you want to trace
            </div>
          </div>
        </div>


        <div className="p-5">

          <div className="flex flex-col lg:flex-row gap-3">

            <Select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="lg:w-44"
            >
              <option value="function">Function</option>
              <option value="file">File</option>
              <option value="component">Component</option>
              <option value="api">API</option>
            </Select>

            <div className="relative flex-1">

              <Search
                size={15}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-muted
                "
              />

              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    analyze();
                  }
                }}
                className="pl-10 h-10"
                placeholder={
                  targetType === 'function'
                    ? 'e.g. updateUserProfile()'
                    : targetType === 'file'
                      ? 'e.g. src/auth/AuthService.ts'
                      : targetType === 'component'
                        ? 'e.g. UserProfile'
                        : 'e.g. POST /api/users'
                }
              />

            </div>

            <Button
              onClick={analyze}
              disabled={loading || !target.trim()}
              className="h-10 px-5"
            >
              {loading ? (
                'Tracing…'
              ) : (
                <>
                  Analyze Impact
                  <ArrowRight size={14} />
                </>
              )}
            </Button>

          </div>

          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted">
            <span className="size-1.5 rounded-full bg-success" />
            Analysis uses the repository dependency graph and available source context.
          </div>

        </div>

      </Card>


      {/* ─────────────────────────────────────────────
          ERROR
      ───────────────────────────────────────────── */}

      {error && (
        <ErrorState
          title="Impact analysis failed"
          reasons={[error]}
          onRetry={analyze}
        />
      )}


      {/* ─────────────────────────────────────────────
          LOADING
      ───────────────────────────────────────────── */}

      {loading && (
        <Card className="p-2 border-border/70">
          <LoadingState label="Tracing dependency graph and calculating blast radius…" />
        </Card>
      )}


      {/* ─────────────────────────────────────────────
          EMPTY STATE
      ───────────────────────────────────────────── */}

      {!loading && !error && !result && (
        <Card
          className="
            min-h-[330px]
            flex items-center justify-center
            border-dashed
            border-border
            bg-surface/60
          "
        >
          <div className="text-center max-w-md px-6">

            <div
              className="
                mx-auto
                size-14 rounded-2xl
                bg-gradient-to-br
                from-accent/15
                to-purple-500/5
                border border-accent/20
                flex items-center justify-center
                mb-4
              "
            >
              <Network
                size={24}
                className="text-accent-light"
              />
            </div>

            <h2 className="text-heading font-semibold">
              Map your change before you ship
            </h2>

            <p className="text-muted text-sm mt-2 leading-relaxed">
              Enter a function, file, component, or API above to discover
              what could be affected by your change.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['updateUserProfile()', 'AuthService.ts', 'UserProfile', '/api/users'].map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setTarget(example)}
                    className="
                      rounded-lg
                      border border-border
                      bg-surface-raised
                      px-2.5 py-1.5
                      text-[10px]
                      font-mono
                      text-muted
                      hover:text-accent-light
                      hover:border-accent/30
                      transition-colors
                    "
                  >
                    {example}
                  </button>
                ),
              )}
            </div>

          </div>
        </Card>
      )}


      {/* ─────────────────────────────────────────────
          RESULT
      ───────────────────────────────────────────── */}

      {result && !loading && (

        <div className="space-y-6">

          {/* TARGET + SCORE */}

          <Card
            className="
              overflow-hidden
              border-border/80
              bg-surface
            "
          >

            <div
              className="
                px-5 py-3.5
                border-b border-border
                bg-surface-raised/30
                flex items-center justify-between
                gap-3
              "
            >

              <div className="flex items-center gap-2 min-w-0">

                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                  Analyzed target
                </span>

                <ChevronRight size={12} className="text-muted" />

                <span className="text-xs font-mono text-accent-light truncate">
                  {result.target}
                </span>

              </div>

              <span className="text-[10px] text-muted uppercase tracking-wider shrink-0">
                {result.targetType}
              </span>

            </div>


            <div className="p-5 sm:p-6">

              <div className="flex flex-col md:flex-row md:items-center gap-6">

                {/* SCORE RING */}

                <div className="relative size-32 shrink-0 mx-auto md:mx-0">

                  <svg
                    width="128"
                    height="128"
                    viewBox="0 0 128 128"
                    className="-rotate-90"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r="53"
                      stroke="currentColor"
                      strokeWidth="9"
                      fill="none"
                      className="text-surface-raised"
                    />

                    <circle
                      cx="64"
                      cy="64"
                      r="53"
                      stroke="currentColor"
                      strokeWidth="9"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 53}
                      strokeDashoffset={
                        2 * Math.PI * 53 * (1 - score / 100)
                      }
                      strokeLinecap="round"
                      className={
                        score >= 80
                          ? 'text-danger'
                          : score >= 60
                            ? 'text-warning'
                            : 'text-success'
                      }
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="font-mono text-3xl font-semibold text-heading leading-none">
                      {score}
                    </span>

                    <span className="text-[9px] text-muted mt-1">
                      / 100
                    </span>

                  </div>

                </div>


                {/* SCORE DETAILS */}

                <div className="flex-1">

                  <div className="flex items-center gap-2">

                    <ScoreIcon
                      size={17}
                      className={
                        score >= 60
                          ? 'text-warning'
                          : 'text-success'
                      }
                    />

                    <h2 className="text-heading text-lg font-semibold">
                      {scoreLabel}
                    </h2>

                  </div>

                  <p className="text-muted text-sm mt-2 max-w-2xl leading-relaxed">
                    The selected target has a calculated impact score of{' '}
                    <span className="font-mono text-heading">
                      {score}/100
                    </span>
                    . Review the affected areas below before making or
                    deploying this change.
                  </p>


                  {/* IMPACT SUMMARY */}

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">

                    {[
                      {
                        label: 'Components',
                        value: result.affectedComponents.length,
                        icon: Boxes,
                      },
                      {
                        label: 'APIs',
                        value: result.affectedApis.length,
                        icon: Globe2,
                      },
                      {
                        label: 'Services',
                        value: result.indirectDependencies.length,
                        icon: Network,
                      },
                      {
                        label: 'Database',
                        value: result.databaseOperations.length,
                        icon: Database,
                      },
                      {
                        label: 'Tests',
                        value: result.relatedTests.length,
                        icon: FlaskConical,
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="
                            rounded-lg
                            border border-border
                            bg-surface-raised/40
                            px-3 py-2.5
                          "
                        >
                          <div className="flex items-center gap-1.5 text-muted">
                            <Icon size={11} />
                            <span className="text-[9px] uppercase tracking-wider font-semibold">
                              {stat.label}
                            </span>
                          </div>

                          <div className="font-mono text-heading text-lg font-semibold mt-1">
                            {stat.value}
                          </div>
                        </div>
                      );
                    })}

                  </div>

                </div>

              </div>

            </div>

          </Card>


          {/* IMPACT MAP */}

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-heading text-base font-semibold">
                Impact Map
              </h2>

              <p className="text-muted text-xs mt-1">
                Areas that may require review before shipping.
              </p>
            </div>

            <span className="text-[10px] text-muted font-mono">
              {sections.length} areas
            </span>

          </div>


          {/* RESULT CARDS */}

          <div className="grid md:grid-cols-2 gap-4">

            {sections.map((section) => {
              const Icon = section.icon;
              const hasItems = section.items.length > 0;

              return (
                <Card
                  key={section.title}
                  className="
                    overflow-hidden
                    border-border/80
                    bg-surface
                    transition-all duration-200
                    hover:border-accent/25
                    hover:shadow-[0_6px_25px_rgba(0,0,0,0.08)]
                  "
                >

                  <div
                    className="
                      px-4 py-3.5
                      border-b border-border
                      bg-surface-raised/25
                      flex items-center justify-between
                    "
                  >

                    <div className="flex items-center gap-2.5">

                      <div
                        className="
                          size-7 rounded-md
                          bg-accent/10
                          border border-accent/15
                          flex items-center justify-center
                        "
                      >
                        <Icon
                          size={13}
                          className="text-accent-light"
                        />
                      </div>

                      <div>

                        <h3 className="text-heading text-xs font-semibold">
                          {section.title}
                        </h3>

                        <p className="text-[9px] text-muted mt-0.5">
                          {section.description}
                        </p>

                      </div>

                    </div>

                    <span
                      className="
                        min-w-6 h-6
                        px-1.5
                        rounded-md
                        bg-surface-raised
                        border border-border
                        flex items-center justify-center
                        font-mono
                        text-[10px]
                        text-heading
                      "
                    >
                      {section.items.length}
                    </span>

                  </div>


                  <div className="p-4">

                    {!hasItems ? (
                      <div className="flex items-center gap-2.5 py-3 text-xs text-muted">
                        <CheckCircle2 size={14} className="text-success" />
                        No affected items detected.
                      </div>
                    ) : (
                      <div className="space-y-1.5">

                        {section.items.map((item) => (
                          <div
                            key={item}
                            className="
                              group
                              flex items-center gap-2.5
                              rounded-lg
                              border border-border/70
                              bg-surface-raised/35
                              px-3 py-2
                              transition-colors
                              hover:border-accent/25
                            "
                          >

                            <span className="size-1.5 rounded-full bg-accent/60 shrink-0" />

                            <span className="text-xs font-mono text-body truncate">
                              {item}
                            </span>

                            <ChevronRight
                              size={11}
                              className="
                                ml-auto
                                shrink-0
                                text-muted
                                opacity-0
                                group-hover:opacity-100
                                transition-opacity
                              "
                            />

                          </div>
                        ))}

                      </div>
                    )}

                  </div>

                </Card>
              );
            })}

          </div>


          {/* REVIEW NOTICE */}

          <div
            className="
              flex items-start gap-3
              rounded-xl
              border border-warning/20
              bg-warning/5
              px-4 py-3.5
            "
          >

            <AlertTriangle
              size={16}
              className="text-warning mt-0.5 shrink-0"
            />

            <div>

              <div className="text-xs font-semibold text-heading">
                Review before shipping
              </div>

              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Impact analysis identifies affected areas from the
                available repository analysis. It should be used as a
                review aid alongside tests and developer judgment.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}