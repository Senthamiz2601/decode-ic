import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  WandSparkles,
} from 'lucide-react';

import { Card, Button, RiskBadge } from '@/components/primitives';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/states';

import { simulateChange } from '@/services/impactService';
import type { SimulationResult } from '@/types';

export default function ChangeSimulation() {
  const [description, setDescription] = useState(
    'Replace JWT authentication with OAuth-based authentication.',
  );

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!description.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await simulateChange(description.trim());

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to simulate the proposed change.',
      );
    } finally {
      setLoading(false);
    }
  }

  const riskLabel =
    result?.estimatedRisk === 'critical'
      ? 'Critical change risk'
      : result?.estimatedRisk === 'high'
        ? 'High change risk'
        : result?.estimatedRisk === 'medium'
          ? 'Moderate change risk'
          : 'Low change risk';

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
              <WandSparkles size={11} />
              Predictive Analysis
            </span>

          </div>

          <h1 className="text-heading text-2xl sm:text-3xl font-semibold tracking-tight">
            Change Simulation
          </h1>

          <p className="text-muted text-sm mt-1.5 max-w-2xl leading-relaxed">
            Describe a planned change and estimate its downstream effects,
            affected areas, migration steps, and potential risk.
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
            <CheckCircle2
              size={13}
              className="text-success"
            />
            Simulation complete
          </div>
        )}

      </div>


      {/* ─────────────────────────────────────────────
          CHANGE INPUT
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
            flex items-center gap-2.5
          "
        >

          <div
            className="
              size-8 rounded-lg
              bg-accent/10
              border border-accent/20
              flex items-center justify-center
            "
          >
            <Sparkles
              size={14}
              className="text-accent-light"
            />
          </div>

          <div>

            <h2 className="text-xs font-semibold text-heading">
              Proposed Change
            </h2>

            <p className="text-[10px] text-muted mt-0.5">
              Describe what you intend to modify in the repository.
            </p>

          </div>

        </div>


        <div className="p-5">

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (
                (e.ctrlKey || e.metaKey) &&
                e.key === 'Enter'
              ) {
                analyze();
              }
            }}
            rows={4}
            placeholder="Example: Replace JWT authentication with OAuth-based authentication."
            className="
              w-full
              bg-surface-sunken
              border border-border
              rounded-xl
              px-4 py-3
              text-sm
              leading-6
              text-heading
              placeholder:text-muted
              outline-none
              resize-none
              transition-all duration-200
              focus:border-accent/50
              focus:ring-2
              focus:ring-accent/10
            "
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">

            <div className="flex items-center gap-2 text-[10px] text-muted">

              <span className="size-1.5 rounded-full bg-success" />

              <span>
                Ctrl + Enter to run simulation
              </span>

            </div>

            <Button
              onClick={analyze}
              disabled={loading || !description.trim()}
              className="px-5"
            >
              {loading ? (
                'Simulating…'
              ) : (
                <>
                  Simulate Change
                  <ArrowRight size={14} />
                </>
              )}
            </Button>

          </div>

        </div>

      </Card>


      {/* ─────────────────────────────────────────────
          ERROR
      ───────────────────────────────────────────── */}

      {error && (
        <ErrorState
          title="Change simulation failed"
          reasons={[error]}
          onRetry={analyze}
        />
      )}


      {/* ─────────────────────────────────────────────
          LOADING
      ───────────────────────────────────────────── */}

      {loading && (
        <Card className="p-2 border-border/70">
          <LoadingState label="Simulating downstream effects…" />
        </Card>
      )}


      {/* ─────────────────────────────────────────────
          EMPTY STATE
      ───────────────────────────────────────────── */}

      {!loading && !error && !result && (
        <Card
          className="
            min-h-[300px]
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
              <GitBranch
                size={24}
                className="text-accent-light"
              />
            </div>

            <h2 className="text-heading font-semibold">
              Simulate before you change
            </h2>

            <p className="text-muted text-sm mt-2 leading-relaxed">
              Describe your planned change above to estimate which
              parts of the codebase may be affected.
            </p>

          </div>

        </Card>
      )}


      {/* ─────────────────────────────────────────────
          RESULTS
      ───────────────────────────────────────────── */}

      {result && !loading && (

        <div className="space-y-6">

          {/* RISK SUMMARY */}

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

              <div className="flex items-center gap-2">

                <ShieldAlert
                  size={14}
                  className="text-warning"
                />

                <span className="text-xs font-semibold text-heading">
                  Simulation Result
                </span>

              </div>

              <RiskBadge level={result.estimatedRisk} />

            </div>


            <div className="p-5 sm:p-6">

              <div className="flex flex-col md:flex-row md:items-center gap-5">

                <div
                  className="
                    size-16 shrink-0
                    rounded-2xl
                    border border-warning/20
                    bg-warning/5
                    flex items-center justify-center
                  "
                >
                  {result.estimatedRisk === 'low' ? (
                    <CheckCircle2
                      size={27}
                      className="text-success"
                    />
                  ) : (
                    <AlertTriangle
                      size={27}
                      className="text-warning"
                    />
                  )}
                </div>

                <div className="flex-1">

                  <h2 className="text-heading text-lg font-semibold">
                    {riskLabel}
                  </h2>

                  <p className="text-muted text-sm mt-1.5 leading-relaxed">
                    The proposed change may affect{' '}
                    <span className="font-mono text-heading">
                      {result.affected.length}
                    </span>{' '}
                    identified areas. Review the affected components
                    and migration plan before implementation.
                  </p>

                </div>

                <div
                  className="
                    rounded-xl
                    border border-border
                    bg-surface-raised/50
                    px-4 py-3
                    min-w-[150px]
                  "
                >

                  <div className="text-[9px] uppercase tracking-wider font-semibold text-muted">
                    Affected areas
                  </div>

                  <div className="font-mono text-2xl font-semibold text-heading mt-1">
                    {result.affected.length}
                  </div>

                </div>

              </div>

            </div>

          </Card>


          {/* RESULT GRID */}

          <div className="grid lg:grid-cols-2 gap-5">

            {/* AFFECTED AREAS */}

            <Card
              className="
                overflow-hidden
                border-border/80
                bg-surface
              "
            >

              <div
                className="
                  px-5 py-4
                  border-b border-border
                  bg-surface-raised/25
                  flex items-center justify-between
                "
              >

                <div className="flex items-center gap-2.5">

                  <div
                    className="
                      size-8 rounded-lg
                      bg-warning/10
                      border border-warning/15
                      flex items-center justify-center
                    "
                  >
                    <GitBranch
                      size={14}
                      className="text-warning"
                    />
                  </div>

                  <div>

                    <h3 className="text-xs font-semibold text-heading">
                      Potentially Affected
                    </h3>

                    <p className="text-[10px] text-muted mt-0.5">
                      Areas within the simulated change radius.
                    </p>

                  </div>

                </div>

                <span
                  className="
                    min-w-7 h-7
                    px-2
                    rounded-md
                    border border-border
                    bg-surface-raised
                    flex items-center justify-center
                    font-mono text-[10px]
                    text-heading
                  "
                >
                  {result.affected.length}
                </span>

              </div>


              <div className="p-4">

                {result.affected.length === 0 ? (

                  <div className="flex items-center gap-2.5 py-5 text-xs text-muted">
                    <CheckCircle2
                      size={15}
                      className="text-success"
                    />
                    No affected areas were identified.
                  </div>

                ) : (

                  <div className="space-y-1.5">

                    {result.affected.map((item) => (

                      <div
                        key={item}
                        className="
                          group
                          flex items-center gap-2.5
                          rounded-lg
                          border border-border/70
                          bg-surface-raised/35
                          px-3 py-2.5
                          transition-colors
                          hover:border-accent/25
                        "
                      >

                        <span
                          className="
                            size-1.5 rounded-full
                            bg-warning
                            shrink-0
                          "
                        />

                        <span className="text-xs font-mono text-body truncate">
                          {item}
                        </span>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </Card>


            {/* MIGRATION PLAN */}

            <Card
              className="
                overflow-hidden
                border-border/80
                bg-surface
              "
            >

              <div
                className="
                  px-5 py-4
                  border-b border-border
                  bg-surface-raised/25
                  flex items-center gap-2.5
                "
              >

                <div
                  className="
                    size-8 rounded-lg
                    bg-accent/10
                    border border-accent/15
                    flex items-center justify-center
                  "
                >
                  <ListChecks
                    size={14}
                    className="text-accent-light"
                  />
                </div>

                <div>

                  <h3 className="text-xs font-semibold text-heading">
                    Suggested Migration Plan
                  </h3>

                  <p className="text-[10px] text-muted mt-0.5">
                    Recommended sequence for implementing the change.
                  </p>

                </div>

              </div>


              <div className="p-4">

                {result.migrationPlan.length === 0 ? (

                  <EmptyState
                    icon={ListChecks}
                    title="No migration steps"
                    description="The simulator did not return a migration plan for this change."
                  />

                ) : (

                  <div className="space-y-1">

                    {result.migrationPlan.map((step, index) => (

                      <div
                        key={`${index}-${step}`}
                        className="
                          flex items-start gap-3
                          rounded-lg
                          px-2 py-3
                          hover:bg-surface-raised/40
                          transition-colors
                        "
                      >

                        <div className="flex flex-col items-center shrink-0">

                          <span
                            className="
                              size-7
                              rounded-lg
                              bg-accent/10
                              border border-accent/20
                              flex items-center justify-center
                              font-mono
                              text-[10px]
                              font-semibold
                              text-accent-light
                            "
                          >
                            {index + 1}
                          </span>

                          {index < result.migrationPlan.length - 1 && (
                            <span className="w-px h-4 bg-border mt-1" />
                          )}

                        </div>

                        <p className="text-xs text-body leading-6 pt-0.5">
                          {step}
                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </Card>

          </div>


          {/* FOOTNOTE */}

          <div
            className="
              flex items-start gap-3
              rounded-xl
              border border-border
              bg-surface-raised/30
              px-4 py-3.5
            "
          >

            <AlertTriangle
              size={15}
              className="text-muted mt-0.5 shrink-0"
            />

            <p className="text-[10px] text-muted leading-relaxed">
              Simulation results are based on the repository analysis
              and available dependency context. Treat them as a
              planning aid and validate the proposed change with
              tests and developer review.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}