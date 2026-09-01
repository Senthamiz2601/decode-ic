import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  FileCode,
  Lightbulb,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  WandSparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { Card, RiskBadge, Button } from '@/components/primitives';
import { LoadingState, EmptyState, ErrorState } from '@/components/states';
import { getRisks } from '@/services/riskService';
import type { Risk } from '@/types';
import { cn } from '@/utils/cn';

// AI Refactoring currently surfaces deterministic analyzer findings.
// No code is modified automatically and no generative-AI result is invented.
export default function AIRefactoring() {
  const { id } = useParams();

  const [risks, setRisks] = useState<Risk[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getRisks(id);

      if (!result?.ok) {
        throw new Error(
          result?.message || 'Failed to load analysis findings',
        );
      }

      setAvailable(result.available !== false);
      setRisks(result.risks || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load analysis findings',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const highPriority = risks.filter(
    (risk) => risk.level === 'critical' || risk.level === 'high',
  ).length;

  const mediumPriority = risks.filter(
    (risk) => risk.level === 'medium',
  ).length;

  const lowPriority = risks.filter(
    (risk) => risk.level === 'low',
  ).length;

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}

      <div className="flex items-start justify-between gap-4 flex-wrap">

        <div className="flex items-start gap-3">

          <div
            className="
              size-11 shrink-0 rounded-xl
              bg-gradient-to-br from-accent/25 to-purple-500/10
              border border-accent/30
              flex items-center justify-center
              shadow-[0_0_30px_rgba(99,102,241,0.12)]
            "
          >
            <WandSparkles
              size={20}
              className="text-accent-light"
            />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-heading text-2xl font-semibold">
                AI Refactoring
              </h1>

              <span
                className="
                  hidden sm:inline-flex
                  items-center gap-1.5
                  rounded-full
                  border border-accent/20
                  bg-accent/5
                  px-2 py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-accent-light
                "
              >
                <Sparkles size={10} />
                Recommendations
              </span>

            </div>

            <p className="text-muted text-sm mt-1 max-w-2xl">
              Identify refactoring opportunities from the repository's
              current deterministic analysis.
            </p>

          </div>

        </div>

        {id && !loading && !error && available && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={load}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw size={13} />
            Refresh
          </Button>
        )}

      </div>


      {/* ─────────────────────────────────────────────
          IMPORTANT NOTICE
      ───────────────────────────────────────────── */}

      {!loading && !error && available && risks.length > 0 && (
        <Card
          className="
            relative overflow-hidden
            border-accent/20
            bg-gradient-to-r
            from-accent/5
            via-surface
            to-purple-500/5
          "
        >

          <div className="absolute -right-10 -top-10 size-32 rounded-full bg-accent/5 blur-2xl" />

          <div className="relative flex items-start gap-3 p-4">

            <div
              className="
                size-8 shrink-0 rounded-lg
                bg-accent/10
                border border-accent/20
                flex items-center justify-center
              "
            >
              <Lightbulb
                size={15}
                className="text-accent-light"
              />
            </div>

            <div className="min-w-0">

              <div className="text-xs font-semibold text-heading">
                Safe refactoring guidance
              </div>

              <p className="text-xs text-muted mt-1 leading-relaxed">
                Decode.ic only recommends areas that may need attention.
                It does not automatically modify, delete, or rewrite
                repository code.
              </p>

            </div>

          </div>

        </Card>
      )}


      {/* ─────────────────────────────────────────────
          LOADING / ERROR / EMPTY
      ───────────────────────────────────────────── */}

      {loading ? (

        <LoadingState label="Loading refactoring suggestions…" />

      ) : error ? (

        <ErrorState
          title="Could not load refactoring analysis"
          reasons={[error]}
          onRetry={load}
        />

      ) : !available ? (

        <Card
          className="
            p-8
            border-border
            bg-surface
          "
        >
          <EmptyState
            icon={ShieldAlert}
            title="Analysis required"
            description="This repository has not been analyzed yet. Run a repository analysis to generate refactoring recommendations."
          />
        </Card>

      ) : risks.length === 0 ? (

        <Card
          className="
            p-8
            border-success/20
            bg-gradient-to-br from-success/5 to-surface
          "
        >
          <EmptyState
            icon={CheckCircle2}
            title="No refactoring opportunities detected"
            description="The current repository analysis did not surface findings that require refactoring attention."
          />
        </Card>

      ) : (

        <>

          {/* ─────────────────────────────────────────
              SUMMARY
          ───────────────────────────────────────── */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <Card className="p-4 border-danger/15">

              <div className="flex items-center justify-between">

                <div
                  className="
                    size-8 rounded-lg
                    bg-danger/10
                    flex items-center justify-center
                  "
                >
                  <AlertCircle
                    size={15}
                    className="text-danger"
                  />
                </div>

                <span className="font-mono text-xl text-danger font-semibold">
                  {highPriority}
                </span>

              </div>

              <div className="text-muted text-xs mt-3">
                High priority
              </div>

              <div className="text-[10px] text-muted mt-0.5">
                Critical + high findings
              </div>

            </Card>


            <Card className="p-4 border-warning/15">

              <div className="flex items-center justify-between">

                <div
                  className="
                    size-8 rounded-lg
                    bg-warning/10
                    flex items-center justify-center
                  "
                >
                  <ShieldAlert
                    size={15}
                    className="text-warning"
                  />
                </div>

                <span className="font-mono text-xl text-warning font-semibold">
                  {mediumPriority}
                </span>

              </div>

              <div className="text-muted text-xs mt-3">
                Medium priority
              </div>

              <div className="text-[10px] text-muted mt-0.5">
                Worth reviewing
              </div>

            </Card>


            <Card className="p-4 border-success/15">

              <div className="flex items-center justify-between">

                <div
                  className="
                    size-8 rounded-lg
                    bg-success/10
                    flex items-center justify-center
                  "
                >
                  <CheckCircle2
                    size={15}
                    className="text-success"
                  />
                </div>

                <span className="font-mono text-xl text-success font-semibold">
                  {lowPriority}
                </span>

              </div>

              <div className="text-muted text-xs mt-3">
                Low priority
              </div>

              <div className="text-[10px] text-muted mt-0.5">
                Minor improvements
              </div>

            </Card>

          </div>


          {/* ─────────────────────────────────────────
              FINDINGS
          ───────────────────────────────────────── */}

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-heading text-sm font-semibold">
                  Refactoring Opportunities
                </h2>

                <p className="text-muted text-xs mt-1">
                  {risks.length} finding{risks.length !== 1 ? 's' : ''}{' '}
                  identified from repository analysis
                </p>

              </div>

              <span
                className="
                  hidden sm:inline-flex
                  items-center gap-1.5
                  text-[10px]
                  uppercase
                  tracking-wider
                  font-semibold
                  text-muted
                "
              >
                <Sparkles size={11} />
                Analyzer driven
              </span>

            </div>


            {risks.map((risk, index) => (

              <Card
                key={risk.id}
                className="
                  group
                  overflow-hidden
                  border-border/80
                  bg-surface
                  transition-all duration-200
                  hover:border-accent/30
                  hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]
                "
              >

                {/* FINDING HEADER */}

                <div className="p-5">

                  <div className="flex items-start gap-4">

                    <div
                      className="
                        hidden sm:flex
                        size-9 shrink-0
                        rounded-lg
                        bg-accent/10
                        border border-accent/15
                        items-center justify-center
                        text-xs font-mono
                        text-accent-light
                      "
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3
                            className="
                              text-heading
                              text-sm
                              sm:text-base
                              font-semibold
                              leading-snug
                            "
                          >
                            {risk.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-1.5">

                            <FileCode
                              size={12}
                              className="text-muted shrink-0"
                            />

                            <span
                              className="
                                text-muted
                                text-xs
                                font-mono
                                truncate
                              "
                            >
                              {risk.module}
                            </span>

                          </div>

                        </div>

                        <RiskBadge level={risk.level} />

                      </div>


                      {/* REASONS */}

                      {risk.reasons.length > 0 && (

                        <div className="mt-5">

                          <div
                            className="
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-semibold
                              text-muted
                              mb-2
                            "
                          >
                            Why this matters
                          </div>

                          <div className="space-y-2">

                            {risk.reasons.map((reason) => (

                              <div
                                key={reason}
                                className="
                                  flex items-start gap-2
                                  text-xs
                                  text-body
                                  leading-relaxed
                                "
                              >

                                <span
                                  className="
                                    size-1.5
                                    rounded-full
                                    bg-accent
                                    mt-1.5
                                    shrink-0
                                  "
                                />

                                <span>{reason}</span>

                              </div>

                            ))}

                          </div>

                        </div>

                      )}


                      {/* RECOMMENDATION + FILES */}

                      <div
                        className="
                          grid
                          md:grid-cols-2
                          gap-5
                          mt-5
                          pt-5
                          border-t border-border/60
                        "
                      >

                        <div>

                          <div
                            className="
                              flex items-center gap-1.5
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-semibold
                              text-muted
                              mb-2
                            "
                          >
                            <Lightbulb size={11} />
                            Recommendation
                          </div>

                          <p
                            className="
                              text-xs
                              text-body
                              leading-relaxed
                            "
                          >
                            {risk.recommendation}
                          </p>

                        </div>


                        <div>

                          <div
                            className="
                              flex items-center gap-1.5
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-semibold
                              text-muted
                              mb-2
                            "
                          >
                            <FileCode size={11} />
                            Affected files
                          </div>

                          {risk.affectedFiles.length > 0 ? (

                            <div className="space-y-1.5">

                              {risk.affectedFiles.map((file) => (

                                <div
                                  key={file}
                                  className="
                                    flex items-center gap-2
                                    min-w-0
                                  "
                                >

                                  <ArrowUpRight
                                    size={11}
                                    className="
                                      text-accent-light
                                      shrink-0
                                    "
                                  />

                                  <span
                                    className="
                                      text-xs
                                      font-mono
                                      text-accent-light
                                      truncate
                                    "
                                    title={file}
                                  >
                                    {file}
                                  </span>

                                </div>

                              ))}

                            </div>

                          ) : (

                            <span className="text-xs text-muted">
                              No affected files reported
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* FOOTER */}

                <div
                  className="
                    flex items-center justify-between
                    gap-3
                    px-5 py-3
                    border-t border-border/60
                    bg-surface-raised/30
                  "
                >

                  <div className="flex items-center gap-2">

                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        risk.level === 'critical' ||
                          risk.level === 'high'
                          ? 'bg-danger'
                          : risk.level === 'medium'
                            ? 'bg-warning'
                            : 'bg-success',
                      )}
                    />

                    <span className="text-[10px] text-muted">
                      Priority: {risk.level}
                    </span>

                  </div>

                  <span className="text-[10px] text-muted">
                    Recommendation only
                  </span>

                </div>

              </Card>

            ))}

          </div>

        </>

      )}

    </div>
  );
}