import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
AlertTriangle,
ArrowDown,
ArrowUp,
CheckCircle2,
ChevronDown,
ChevronUp,
FileCode2,
Shield,
ShieldAlert,
ShieldCheck,
Target,
TrendingDown,
Zap,
} from 'lucide-react';

import {
Card,
RiskBadge,
Select,
Button,
} from '@/components/primitives';

import {
EmptyState,
ErrorState,
LoadingState,
} from '@/components/states';

import { getRisks } from '@/services/riskService';
import type { Risk } from '@/types';

export default function RiskCenter() {
const { id } = useParams();

const [filter, setFilter] =
useState<'all' | 'high' | 'medium' | 'low'>('all');

const [risks, setRisks] = useState<Risk[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [expandedRisk, setExpandedRisk] =
useState<string | null>(null);

const load = useCallback(async () => {
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
      result?.message || 'Failed to load risks',
    );
  }

  setRisks(result.risks || []);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Failed to load risks',
  );
} finally {
  setLoading(false);
}

}, [id]);

useEffect(() => {
load();
}, [load]);

const counts = useMemo(
() => ({
high: risks.filter(
(r) =>
r.level === 'high' ||
r.level === 'critical',
).length,

  medium: risks.filter(
    (r) => r.level === 'medium',
  ).length,

  low: risks.filter(
    (r) => r.level === 'low',
  ).length,
}),
[risks],

);

const overallScore = risks.length
? Math.round(
risks.reduce(
(sum, risk) => sum + risk.score,
0,
) / risks.length,
)
: 100;

const filtered = useMemo(
() =>
risks.filter(
(risk) =>
filter === 'all' ||
risk.level === filter ||
(filter === 'high' &&
risk.level === 'critical'),
),
[risks, filter],
);

const scoreLabel =
overallScore >= 80
? 'Low exposure'
: overallScore >= 60
? 'Moderate exposure'
: 'High exposure';

const scoreIcon =
overallScore >= 80
? CheckCircle2
: overallScore >= 60
? Shield
: ShieldAlert;

const ScoreIcon = scoreIcon;

function toggleInvestigation(riskId: string) {
setExpandedRisk((current) =>
current === riskId ? null : riskId,
);
}

if (loading) {
return <LoadingState label="Analyzing repository risks…" />;
}

if (error) {
return ( <ErrorState
     title="Could not load risk data"
     reasons={[error]}
     onRetry={load}
   />
);
}

return ( <div className="space-y-6 pb-8">

```
  {/* ─────────────────────────────────────────────
      HEADER
  ───────────────────────────────────────────── */}

  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

    <div>

      <div className="flex items-center gap-3 mb-2">

        <div
          className="
            size-10 rounded-xl
            bg-gradient-to-br
            from-danger/15
            to-orange-500/10
            border border-danger/20
            flex items-center justify-center
          "
        >
          <ShieldAlert
            size={19}
            className="text-danger"
          />
        </div>

        <div className="flex items-center gap-2">

          <h1 className="text-heading text-2xl font-semibold">
            Risk Center
          </h1>

          <span
            className="
              hidden sm:inline-flex
              items-center gap-1.5
              rounded-full
              border border-border
              bg-surface-raised
              px-2 py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-muted
            "
          >
            <span className="size-1.5 rounded-full bg-danger" />
            Security analysis
          </span>

        </div>

      </div>

      <p className="text-muted text-sm max-w-2xl">
        Identify high-impact findings, understand affected
        files, and prioritize the risks that need attention.
      </p>

    </div>


    {/* FILTER */}

    <div className="flex items-center gap-3">

      <div
        className="
          hidden sm:flex
          items-center gap-2
          text-xs text-muted
          px-3 py-2
          rounded-lg
          border border-border
          bg-surface-raised/50
        "
      >
        <Target
          size={13}
          className="text-accent-light"
        />

        <span>
          {risks.length} finding
          {risks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Select
        value={filter}
        onChange={(e) =>
          setFilter(
            e.target.value as
              | 'all'
              | 'high'
              | 'medium'
              | 'low',
          )
        }
      >
        <option value="all">
          All risks
        </option>
        <option value="high">
          High risk
        </option>
        <option value="medium">
          Medium risk
        </option>
        <option value="low">
          Low risk
        </option>
      </Select>

    </div>

  </div>


  {/* ─────────────────────────────────────────────
      RISK OVERVIEW
  ───────────────────────────────────────────── */}

  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

    {/* OVERALL SCORE */}

    <Card
      className="
        lg:col-span-1
        p-5
        relative
        overflow-hidden
        border-border/80
        bg-gradient-to-br
        from-surface
        to-surface-raised/40
      "
    >

      <div
        className="
          absolute
          -right-10
          -top-10
          size-28
          rounded-full
          bg-accent/5
          blur-2xl
        "
      />

      <div className="relative">

        <div className="flex items-center justify-between">

          <span
            className="
              text-[10px]
              uppercase
              tracking-wider
              font-semibold
              text-muted
            "
          >
            Overall risk score
          </span>

          <ScoreIcon
            size={16}
            className={
              overallScore >= 80
                ? 'text-success'
                : overallScore >= 60
                  ? 'text-warning'
                  : 'text-danger'
            }
          />

        </div>

        <div className="flex items-end gap-2 mt-4">

          <span
            className="
              font-mono
              text-4xl
              font-semibold
              text-heading
            "
          >
            {overallScore}
          </span>

          <span className="text-muted text-sm mb-1.5">
            /100
          </span>

        </div>

        <div className="mt-3">

          <div className="flex items-center justify-between mb-1.5">

            <span className="text-[11px] text-muted">
              {scoreLabel}
            </span>

            <span className="text-[10px] text-muted">
              {risks.length
                ? 'Based on findings'
                : 'No findings'}
            </span>

          </div>

          <div className="h-1.5 rounded-full bg-border overflow-hidden">

            <div
              className={`
                h-full
                rounded-full
                transition-all duration-500
                ${
                  overallScore >= 80
                    ? 'bg-success'
                    : overallScore >= 60
                      ? 'bg-warning'
                      : 'bg-danger'
                }
              `}
              style={{
                width: `${Math.min(
                  overallScore,
                  100,
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

    </Card>


    {/* HIGH */}

    <Card
      className="
        p-5
        border-border/80
        hover:border-danger/25
        transition-colors
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <div className="flex items-center gap-2">

            <div
              className="
                size-8 rounded-lg
                bg-danger/10
                flex items-center justify-center
              "
            >
              <AlertTriangle
                size={15}
                className="text-danger"
              />
            </div>

            <span className="text-xs text-muted">
              High risk
            </span>

          </div>

          <div className="font-mono text-3xl font-semibold text-danger mt-4">
            {counts.high}
          </div>

          <p className="text-[11px] text-muted mt-1">
            Requires immediate attention
          </p>

        </div>

        {counts.high > 0 && (
          <ArrowUp
            size={14}
            className="text-danger"
          />
        )}

      </div>

    </Card>


    {/* MEDIUM */}

    <Card
      className="
        p-5
        border-border/80
        hover:border-warning/25
        transition-colors
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <div className="flex items-center gap-2">

            <div
              className="
                size-8 rounded-lg
                bg-warning/10
                flex items-center justify-center
              "
            >
              <Shield
                size={15}
                className="text-warning"
              />
            </div>

            <span className="text-xs text-muted">
              Medium risk
            </span>

          </div>

          <div className="font-mono text-3xl font-semibold text-warning mt-4">
            {counts.medium}
          </div>

          <p className="text-[11px] text-muted mt-1">
            Worth reviewing
          </p>

        </div>

      </div>

    </Card>


    {/* LOW */}

    <Card
      className="
        p-5
        border-border/80
        hover:border-success/25
        transition-colors
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <div className="flex items-center gap-2">

            <div
              className="
                size-8 rounded-lg
                bg-success/10
                flex items-center justify-center
              "
            >
              <ShieldCheck
                size={15}
                className="text-success"
              />
            </div>

            <span className="text-xs text-muted">
              Low risk
            </span>

          </div>

          <div className="font-mono text-3xl font-semibold text-success mt-4">
            {counts.low}
          </div>

          <p className="text-[11px] text-muted mt-1">
            Lower priority findings
          </p>

        </div>

        <TrendingDown
          size={14}
          className="text-success"
        />

      </div>

    </Card>

  </div>


  {/* ─────────────────────────────────────────────
      FINDINGS HEADER
  ───────────────────────────────────────────── */}

  <div className="flex items-center justify-between pt-2">

    <div>

      <h2 className="text-heading font-semibold text-base">
        Risk findings
      </h2>

      <p className="text-muted text-xs mt-1">
        {filtered.length} matching finding
        {filtered.length !== 1 ? 's' : ''}
      </p>

    </div>

    {filter !== 'all' && (
      <button
        type="button"
        onClick={() => setFilter('all')}
        className="
          text-xs
          text-accent-light
          hover:text-heading
          transition-colors
        "
      >
        Clear filter
      </button>
    )}

  </div>


  {/* ─────────────────────────────────────────────
      EMPTY
  ───────────────────────────────────────────── */}

  {filtered.length === 0 ? (

    <Card className="border-border/80">

      <EmptyState
        icon={ShieldCheck}
        title={
          risks.length === 0
            ? 'No risks detected'
            : 'No risks in this category'
        }
        description={
          risks.length === 0
            ? 'The analyzer did not flag any risk findings for this repository.'
            : 'There are no findings matching the selected risk level. Try another filter.'
        }
      />

    </Card>

  ) : (

    <div className="space-y-3">

      {filtered.map((risk) => {

        const isExpanded =
          expandedRisk === risk.id;

        const isHigh =
          risk.level === 'high' ||
          risk.level === 'critical';

        return (

          <Card
            key={risk.id}
            className={`
              overflow-hidden
              border-border/80
              transition-all duration-200
              ${
                isExpanded
                  ? 'border-accent/30 shadow-[0_8px_30px_rgba(99,102,241,0.06)]'
                  : 'hover:border-border'
              }
            `}
          >

            {/* MAIN ROW */}

            <div className="p-5">

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">

                {/* TITLE */}

                <div className="min-w-0">

                  <div className="flex items-start gap-3">

                    <div
                      className={`
                        size-9
                        shrink-0
                        rounded-lg
                        flex items-center justify-center
                        ${
                          isHigh
                            ? 'bg-danger/10'
                            : risk.level === 'medium'
                              ? 'bg-warning/10'
                              : 'bg-success/10'
                        }
                      `}
                    >
                      {isHigh ? (
                        <AlertTriangle
                          size={16}
                          className="text-danger"
                        />
                      ) : risk.level === 'medium' ? (
                        <Shield
                          size={16}
                          className="text-warning"
                        />
                      ) : (
                        <ShieldCheck
                          size={16}
                          className="text-success"
                        />
                      )}
                    </div>

                    <div className="min-w-0">

                      <h3 className="text-heading font-semibold text-sm sm:text-base">
                        {risk.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5">

                        <FileCode2
                          size={11}
                          className="text-muted"
                        />

                        <span className="text-muted text-xs font-mono truncate">
                          {risk.module}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>


                {/* SCORE / LEVEL */}

                <div className="flex items-center gap-3 shrink-0">

                  <div className="text-right">

                    <div className="font-mono text-lg font-semibold text-heading">
                      {risk.score}
                      <span className="text-muted text-xs font-normal">
                        /100
                      </span>
                    </div>

                    <div className="text-[10px] text-muted">
                      Risk score
                    </div>

                  </div>

                  <RiskBadge level={risk.level} />

                </div>

              </div>


              {/* DIVIDER */}

              <div className="border-t border-border/60 mt-5 pt-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* REASONS */}

                  <div>

                    <div
                      className="
                        flex items-center gap-2
                        text-[10px]
                        uppercase
                        tracking-wider
                        font-semibold
                        text-muted
                        mb-2.5
                      "
                    >
                      <Zap size={11} />
                      Why this matters
                    </div>

                    <ul className="space-y-2">

                      {risk.reasons.map((reason) => (

                        <li
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
                              bg-muted
                              mt-1.5
                              shrink-0
                            "
                          />

                          <span>
                            {reason}
                          </span>

                        </li>

                      ))}

                    </ul>

                  </div>


                  {/* FILES */}

                  <div>

                    <div
                      className="
                        flex items-center gap-2
                        text-[10px]
                        uppercase
                        tracking-wider
                        font-semibold
                        text-muted
                        mb-2.5
                      "
                    >
                      <FileCode2 size={11} />
                      Affected files
                    </div>

                    <div className="space-y-1.5">

                      {risk.affectedFiles.map((file) => (

                        <div
                          key={file}
                          className="
                            flex items-center gap-2
                            rounded-md
                            border border-border/60
                            bg-surface-raised/50
                            px-2.5 py-2
                          "
                        >

                          <FileCode2
                            size={11}
                            className="text-accent-light shrink-0"
                          />

                          <span
                            className="
                              text-[11px]
                              font-mono
                              text-accent-light
                              truncate
                            "
                          >
                            {file}
                          </span>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </div>


              {/* ACTION ROW */}

              <div
                className="
                  flex flex-col sm:flex-row
                  sm:items-center
                  justify-between
                  gap-3
                  mt-5
                  pt-4
                  border-t border-border/60
                "
              >

                <div className="flex items-center gap-2 min-w-0">

                  <span
                    className="
                      size-1.5
                      rounded-full
                      bg-accent
                      shrink-0
                    "
                  />

                  <p className="text-xs text-body truncate">
                    {risk.recommendation}
                  </p>

                </div>


                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    toggleInvestigation(risk.id)
                  }
                  className="shrink-0"
                >

                  {isExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      Hide investigation
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Investigate
                    </>
                  )}

                </Button>

              </div>

            </div>


            {/* INVESTIGATION PANEL */}

            {isExpanded && (

              <div
                className="
                  border-t border-accent/15
                  bg-accent/[0.025]
                  px-5 py-5
                "
              >

                <div className="grid md:grid-cols-3 gap-4">

                  <div
                    className="
                      rounded-xl
                      border border-border/70
                      bg-surface
                      p-4
                    "
                  >

                    <div className="flex items-center gap-2 mb-2">

                      <Target
                        size={14}
                        className="text-accent-light"
                      />

                      <span className="text-xs font-semibold text-heading">
                        Priority
                      </span>

                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {isHigh
                        ? 'Prioritize this finding before shipping changes that affect the affected module.'
                        : risk.level === 'medium'
                          ? 'Review this finding during the next maintenance cycle.'
                          : 'Track this finding and address it when convenient.'}
                    </p>

                  </div>


                  <div
                    className="
                      rounded-xl
                      border border-border/70
                      bg-surface
                      p-4
                    "
                  >

                    <div className="flex items-center gap-2 mb-2">

                      <FileCode2
                        size={14}
                        className="text-accent-light"
                      />

                      <span className="text-xs font-semibold text-heading">
                        Scope
                      </span>

                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {risk.affectedFiles.length}{' '}
                      affected file
                      {risk.affectedFiles.length !== 1
                        ? 's'
                        : ''}{' '}
                      identified by the repository analysis.
                    </p>

                  </div>


                  <div
                    className="
                      rounded-xl
                      border border-border/70
                      bg-surface
                      p-4
                    "
                  >

                    <div className="flex items-center gap-2 mb-2">

                      <Zap
                        size={14}
                        className="text-accent-light"
                      />

                      <span className="text-xs font-semibold text-heading">
                        Recommended action
                      </span>

                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {risk.recommendation}
                    </p>

                  </div>

                </div>

              </div>

            )}

          </Card>

        );
      })}

    </div>

  )}

</div>

);
}
