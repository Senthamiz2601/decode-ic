import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  FileCode,
  Bot,
  User,
  ChevronRight,
  MessageSquare,
  Code2,
  Zap,
  Database,
  AlertCircle,
  RefreshCw,
  GitBranch,
  ShieldAlert,
  Package,
  Activity,
} from 'lucide-react';

import { Card, Button } from '@/components/primitives';
import type { AIMessage } from '@/types';
import { cn } from '@/utils/cn';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RepositoryAnalysis {
  fileCount?: number;
  linesOfCode?: number;
  commentLines?: number;
  sourceFileCount?: number;
  dependencyCount?: number;
  dependencyDetails?: Array<{
    manifest?: string;
    ecosystem?: string;
    count?: number;
    dependencies?: string[];
  }>;
  componentCount?: number;
  apiEndpointCount?: number;
  apiEndpoints?: Array<{
    method?: string;
    path?: string;
    file?: string;
  }>;
  healthScore?: number;
  technicalDebtPercent?: number;
  riskLevel?: string;
  languages?: Array<{
    language?: string;
    linesOfCode?: number;
    percent?: number;
  }>;
  findings?: Array<{
    ruleId?: string;
    severity?: string;
    message?: string;
    file?: string;
  }>;
  architecture?: unknown;
  analyzedAt?: string;
}

interface Repository {
  id?: string | number;
  name?: string;
  fullName?: string;
  owner?: string;
  defaultBranch?: string;
  branch?: string;
  status?: string;
  analysis?: RepositoryAnalysis;
}

function formatNumber(value?: number) {
  if (typeof value !== 'number') return '0';
  return value.toLocaleString();
}

function createSuggestedQuestions(
  repository: Repository,
): string[] {
  const analysis = repository.analysis;

  if (!analysis) {
    return [
      'What should I analyze first in this repository?',
      'Is the repository analysis available?',
    ];
  }

  const questions: string[] = [];

  if (
    typeof analysis.healthScore === 'number'
  ) {
    questions.push(
      `Why is the current code health score ${analysis.healthScore}/100?`,
    );
  }

  if (
    typeof analysis.dependencyCount === 'number'
  ) {
    questions.push(
      `What are the main dependencies in this repository?`,
    );
  }

  if (
    typeof analysis.technicalDebtPercent === 'number'
  ) {
    questions.push(
      `Where is the technical debt coming from?`,
    );
  }

  if (
    typeof analysis.apiEndpointCount === 'number' &&
    analysis.apiEndpointCount > 0
  ) {
    questions.push(
      `What API endpoints were detected and where are they defined?`,
    );
  }

  if (
    analysis.findings &&
    analysis.findings.length > 0
  ) {
    questions.push(
      `What are the most important code findings I should fix?`,
    );
  }

  if (
    analysis.languages &&
    analysis.languages.length > 0
  ) {
    questions.push(
      `What technologies and languages dominate this repository?`,
    );
  }

  questions.push(
    'Give me a quick technical overview of this repository.',
  );

  questions.push(
    'What should I improve before production deployment?',
  );

  return [...new Set(questions)].slice(0, 6);
}

function buildRepositoryAnswer(
  question: string,
  repository: Repository,
): {
  content: string;
  relatedFiles?: string[];
} {
  const analysis = repository.analysis;

  if (!analysis) {
    return {
      content:
        'Repository analysis is not available yet. Please run repository analysis first, then ask the assistant again.',
    };
  }

  const q = question.toLowerCase();

  /*
   * ─────────────────────────────────────────────
   * GENERAL OVERVIEW
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('overview') ||
    q.includes('summary') ||
    q.includes('repository')
  ) {
    const languages =
      analysis.languages
        ?.slice(0, 5)
        .map(
          (item) =>
            `${item.language || 'Unknown'} (${item.percent ?? 0}%)`,
        )
        .join(', ') || 'Not detected';

    return {
      content: [
        `I analyzed the current repository analysis for ${repository.fullName || repository.name || 'this repository'}.`,
        '',
        `Files analyzed: ${formatNumber(analysis.fileCount)}`,
        `Lines of code: ${formatNumber(analysis.linesOfCode)}`,
        `Source files: ${formatNumber(analysis.sourceFileCount)}`,
        `Dependencies: ${formatNumber(analysis.dependencyCount)}`,
        `API endpoints: ${formatNumber(analysis.apiEndpointCount)}`,
        `Components detected: ${formatNumber(analysis.componentCount)}`,
        `Code health: ${analysis.healthScore ?? 0}/100`,
        `Technical debt: ${analysis.technicalDebtPercent ?? 0}%`,
        `Risk level: ${analysis.riskLevel || 'Not available'}`,
        `Main technologies: ${languages}`,
      ].join('\n'),
    };
  }

  /*
   * ─────────────────────────────────────────────
   * HEALTH
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('health') ||
    q.includes('quality') ||
    q.includes('score')
  ) {
    const findings = analysis.findings || [];

    const findingText =
      findings.length > 0
        ? findings
            .slice(0, 5)
            .map(
              (finding, index) =>
                `${index + 1}. ${finding.message || 'Code finding detected'}${
                  finding.file
                    ? ` — ${finding.file}`
                    : ''
                }`,
            )
            .join('\n')
        : 'No code findings were reported by the current analysis.';

    return {
      content: [
        `Current code health score: ${analysis.healthScore ?? 0}/100.`,
        '',
        `The analyzer found ${findings.length} finding(s).`,
        '',
        findingText,
      ].join('\n'),
      relatedFiles: findings
        .map((finding) => finding.file)
        .filter(Boolean)
        .slice(0, 5) as string[],
    };
  }

  /*
   * ─────────────────────────────────────────────
   * DEPENDENCIES
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('dependenc') ||
    q.includes('package') ||
    q.includes('library')
  ) {
    const dependencyDetails =
      analysis.dependencyDetails || [];

    if (dependencyDetails.length === 0) {
      return {
        content:
          'The current repository analysis did not detect dependency manifests with dependencies.',
      };
    }

    const details = dependencyDetails
      .slice(0, 5)
      .map((item) => {
        const names =
          item.dependencies?.slice(0, 8).join(', ') ||
          'No dependency names available';

        return `${item.manifest || 'manifest'} (${item.ecosystem || 'unknown'}): ${
          item.count || 0
        } dependencies\n${names}`;
      })
      .join('\n\n');

    return {
      content: [
        `The current analysis detected ${analysis.dependencyCount || 0} dependencies.`,
        '',
        details,
      ].join('\n'),
      relatedFiles: dependencyDetails
        .map((item) => item.manifest)
        .filter(Boolean) as string[],
    };
  }

  /*
   * ─────────────────────────────────────────────
   * TECHNICAL DEBT
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('technical debt') ||
    q.includes('tech debt') ||
    q.includes('debt')
  ) {
    const findings = analysis.findings || [];

    return {
      content: [
        `Current estimated technical debt: ${
          analysis.technicalDebtPercent ?? 0
        }%.`,
        '',
        `The repository contains ${findings.length} detected finding(s) that contribute to the current analysis.`,
        '',
        findings.length > 0
          ? findings
              .slice(0, 6)
              .map(
                (finding, index) =>
                  `${index + 1}. ${
                    finding.message || 'Detected code issue'
                  }${
                    finding.file
                      ? ` — ${finding.file}`
                      : ''
                  }`,
              )
              .join('\n')
          : 'No specific findings were returned by the analyzer.',
      ].join('\n'),
      relatedFiles: findings
        .map((finding) => finding.file)
        .filter(Boolean)
        .slice(0, 6) as string[],
    };
  }

  /*
   * ─────────────────────────────────────────────
   * RISKS
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('risk') ||
    q.includes('security') ||
    q.includes('danger')
  ) {
    const findings = analysis.findings || [];

    return {
      content: [
        `Current repository risk level: ${
          analysis.riskLevel || 'Not available'
        }.`,
        '',
        findings.length > 0
          ? `The analyzer currently reports ${findings.length} finding(s) that should be reviewed.`
          : 'No findings were returned by the current deterministic analysis.',
        '',
        findings.length > 0
          ? findings
              .slice(0, 6)
              .map(
                (finding, index) =>
                  `${index + 1}. ${
                    finding.severity
                      ? `[${finding.severity}] `
                      : ''
                  }${
                    finding.message ||
                    'Potential repository issue'
                  }${
                    finding.file
                      ? ` — ${finding.file}`
                      : ''
                  }`,
              )
              .join('\n')
          : '',
      ].join('\n'),
      relatedFiles: findings
        .map((finding) => finding.file)
        .filter(Boolean)
        .slice(0, 6) as string[],
    };
  }

  /*
   * ─────────────────────────────────────────────
   * API ENDPOINTS
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('api') ||
    q.includes('endpoint') ||
    q.includes('route')
  ) {
    const endpoints = analysis.apiEndpoints || [];

    if (endpoints.length === 0) {
      return {
        content:
          'The current repository analysis did not detect any API endpoints.',
      };
    }

    const endpointText = endpoints
      .slice(0, 15)
      .map(
        (endpoint, index) =>
          `${index + 1}. ${endpoint.method || 'UNKNOWN'} ${
            endpoint.path || 'unknown path'
          }${
            endpoint.file
              ? ` — ${endpoint.file}`
              : ''
          }`,
      )
      .join('\n');

    return {
      content: [
        `The analyzer detected ${analysis.apiEndpointCount || endpoints.length} API endpoint(s).`,
        '',
        endpointText,
      ].join('\n'),
      relatedFiles: endpoints
        .map((endpoint) => endpoint.file)
        .filter(Boolean)
        .slice(0, 8) as string[],
    };
  }

  /*
   * ─────────────────────────────────────────────
   * LANGUAGES / TECHNOLOGY
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('language') ||
    q.includes('technology') ||
    q.includes('tech stack') ||
    q.includes('stack')
  ) {
    const languages = analysis.languages || [];

    if (languages.length === 0) {
      return {
        content:
          'The current analysis did not detect language distribution data.',
      };
    }

    return {
      content: [
        'Based on the current repository analysis, the detected language distribution is:',
        '',
        ...languages
          .slice(0, 10)
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.language || 'Unknown'
              } — ${item.percent ?? 0}% (${formatNumber(
                item.linesOfCode,
              )} LOC)`,
          ),
      ].join('\n'),
    };
  }

  /*
   * ─────────────────────────────────────────────
   * FILE / CODE QUESTIONS
   * ─────────────────────────────────────────────
   */

  if (
    q.includes('file') ||
    q.includes('component') ||
    q.includes('code')
  ) {
    return {
      content: [
        'The current analysis reports:',
        '',
        `Files analyzed: ${formatNumber(analysis.fileCount)}`,
        `Source files: ${formatNumber(analysis.sourceFileCount)}`,
        `React/components detected: ${formatNumber(
          analysis.componentCount,
        )}`,
        `Lines of code: ${formatNumber(analysis.linesOfCode)}`,
        `Comment lines: ${formatNumber(analysis.commentLines)}`,
        '',
        'For detailed source inspection, use Code Explorer to browse the actual repository files.',
      ].join('\n'),
    };
  }

  /*
   * ─────────────────────────────────────────────
   * DEFAULT CONTEXTUAL RESPONSE
   * ─────────────────────────────────────────────
   */

  return {
    content: [
      `I checked the current repository analysis before answering.`,
      '',
      `Repository: ${
        repository.fullName ||
        repository.name ||
        'Current repository'
      }`,
      `Files analyzed: ${formatNumber(analysis.fileCount)}`,
      `Lines of code: ${formatNumber(analysis.linesOfCode)}`,
      `Dependencies: ${formatNumber(analysis.dependencyCount)}`,
      `API endpoints: ${formatNumber(analysis.apiEndpointCount)}`,
      `Code health: ${analysis.healthScore ?? 0}/100`,
      `Technical debt: ${
        analysis.technicalDebtPercent ?? 0
      }%`,
      `Risk level: ${analysis.riskLevel || 'Not available'}`,
      '',
      'I can currently answer questions about the repository health, dependencies, API endpoints, languages, findings, technical debt, risks, files, and overall architecture using the stored analysis.',
    ].join('\n'),
  };
}

export default function AIAssistant() {
  const { id } = useParams();

  const [repository, setRepository] =
    useState<Repository | null>(null);

  const [messages, setMessages] =
    useState<AIMessage[]>([]);

  const [suggestedQuestions, setSuggestedQuestions] =
    useState<string[]>([]);

  const [loadingRepository, setLoadingRepository] =
    useState(true);

  const [repositoryError, setRepositoryError] =
    useState<string | null>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  /*
   * ─────────────────────────────────────────────
   * LOAD REAL REPOSITORY ANALYSIS
   * ─────────────────────────────────────────────
   */

  async function loadRepository() {
    if (!id) {
      setLoadingRepository(false);
      setRepositoryError(
        'No repository was selected.',
      );
      return;
    }

    try {
      setLoadingRepository(true);
      setRepositoryError(null);

      const response = await fetch(
        `${API_BASE}/repositories/${id}`,
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ||
            'Failed to load repository',
        );
      }

      setRepository(data.repository);

      const questions =
        createSuggestedQuestions(
          data.repository,
        );

      setSuggestedQuestions(questions);
    } catch (error) {
      console.error(
        'Failed to load repository context:',
        error,
      );

      setRepositoryError(
        error instanceof Error
          ? error.message
          : 'Failed to load repository analysis',
      );
    } finally {
      setLoadingRepository(false);
    }
  }

  useEffect(() => {
    loadRepository();
  }, [id]);

  /*
   * ─────────────────────────────────────────────
   * AUTO SCROLL
   * ─────────────────────────────────────────────
   */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  /*
   * ─────────────────────────────────────────────
   * SEND QUESTION
   * ─────────────────────────────────────────────
   */

  async function send(question: string) {
    if (
      !question.trim() ||
      loading ||
      !repository
    ) {
      return;
    }

    const trimmedQuestion =
      question.trim();

    const timestamp =
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

    const userMessage: AIMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmedQuestion,
      timestamp,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput('');
    setLoading(true);

    try {
      /*
       * No mock data.
       * No /ai/query endpoint.
       *
       * The response is generated from the actual
       * repository.analysis object returned by the
       * backend analyzer.
       */

      const result = buildRepositoryAnswer(
        trimmedQuestion,
        repository,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 350),
      );

      const assistantMessage: AIMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp:
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        ...(result.relatedFiles &&
        result.relatedFiles.length > 0
          ? {
              relatedFiles:
                result.relatedFiles,
            }
          : {}),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        'AI Assistant error:',
        error,
      );

      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Unable to analyze the repository right now.',
        timestamp:
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
      };

      setMessages((current) => [
        ...current,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions =
    messages.length === 0 &&
    !loadingRepository &&
    !repositoryError;

  const analysis =
    repository?.analysis;

  return (
    <div className="space-y-6 h-full flex flex-col">

      {/* PAGE HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div
            className="
              size-11 rounded-xl
              bg-gradient-to-br from-accent/25 to-purple-500/10
              border border-accent/30
              flex items-center justify-center
              shadow-[0_0_30px_rgba(99,102,241,0.12)]
            "
          >
            <Sparkles
              size={20}
              className="text-accent-light"
            />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-heading text-2xl font-semibold">
                Ask your codebase
              </h1>

              {repository && (
                <span
                  className="
                    hidden sm:inline-flex
                    items-center gap-1.5
                    text-[10px] font-semibold uppercase tracking-wider
                    text-success
                    border border-success/20
                    bg-success/5
                    rounded-full px-2 py-1
                  "
                >
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  Connected
                </span>
              )}

            </div>

            <p className="text-muted text-sm mt-1">
              Explore insights generated from the current repository analysis.
            </p>

          </div>

        </div>


        {/* REPOSITORY CONTEXT */}

        <div
          className="
            hidden md:flex items-center gap-2
            px-3.5 py-2.5 rounded-lg
            border border-border
            bg-surface-raised/60
            text-xs text-muted
          "
        >

          <Code2
            size={14}
            className="text-accent-light"
          />

          <span>
            Repository context
          </span>

          <ChevronRight size={13} />

          <span className="text-body font-medium">
            {loadingRepository
              ? 'Loading'
              : repository
                ? 'Loaded'
                : 'Unavailable'}
          </span>

        </div>

      </div>


      {/* WORKSPACE */}

      <Card
        className="
          flex-1 flex flex-col min-h-[620px]
          overflow-hidden
          border-border/80
          bg-surface
          shadow-[0_8px_40px_rgba(0,0,0,0.12)]
        "
      >

        {/* TOP BAR */}

        <div
          className="
            h-12 shrink-0
            border-b border-border
            px-5
            flex items-center justify-between
            bg-surface-raised/40
          "
        >

          <div className="flex items-center gap-2.5">

            <div
              className="
                size-7 rounded-md
                bg-accent/10
                border border-accent/20
                flex items-center justify-center
              "
            >
              <Bot
                size={14}
                className="text-accent-light"
              />
            </div>

            <span className="text-xs font-medium text-heading">
              Decode Assistant
            </span>

          </div>


          <div className="flex items-center gap-2">

            <span
              className={cn(
                'size-1.5 rounded-full',
                loadingRepository
                  ? 'bg-warning animate-pulse'
                  : repository
                    ? 'bg-success'
                    : 'bg-danger',
              )}
            />

            <span className="text-[11px] text-muted">

              {loadingRepository
                ? 'Loading repository analysis'
                : repository
                  ? 'Analysis context loaded'
                  : 'Repository unavailable'}

            </span>

          </div>

        </div>


        {/* CHAT AREA */}

        <div
          className="
            flex-1 overflow-y-auto
            px-4 sm:px-6 lg:px-8
            py-7
            space-y-7
            scrollbar-thin
          "
        >

          {/* LOADING */}

          {loadingRepository && (

            <div
              className="
                min-h-[320px]
                flex flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  size-14 rounded-2xl
                  bg-accent/10
                  border border-accent/20
                  flex items-center justify-center
                  mb-4
                "
              >
                <Database
                  size={23}
                  className="text-accent-light animate-pulse"
                />
              </div>

              <h2 className="text-heading font-semibold text-lg">
                Loading repository context
              </h2>

              <p className="text-muted text-sm mt-2">
                Reading the latest analysis from the connected repository.
              </p>

            </div>

          )}


          {/* ERROR */}

          {!loadingRepository &&
            repositoryError && (

              <div
                className="
                  min-h-[320px]
                  flex flex-col
                  items-center
                  justify-center
                  text-center
                  px-4
                "
              >

                <div
                  className="
                    size-14 rounded-2xl
                    bg-danger/10
                    border border-danger/20
                    flex items-center justify-center
                    mb-4
                  "
                >
                  <AlertCircle
                    size={24}
                    className="text-danger"
                  />
                </div>

                <h2 className="text-heading font-semibold text-lg">
                  Repository context unavailable
                </h2>

                <p className="text-muted text-sm max-w-md mt-2">
                  {repositoryError}
                </p>

                <button
                  type="button"
                  onClick={loadRepository}
                  className="
                    mt-4
                    inline-flex items-center gap-2
                    rounded-lg
                    border border-border
                    bg-surface-raised
                    px-3 py-2
                    text-xs
                    text-body
                    hover:border-accent/40
                    hover:text-heading
                  "
                >
                  <RefreshCw size={12} />
                  Retry
                </button>

              </div>

            )}


          {/* EMPTY STATE */}

          {!loadingRepository &&
            !repositoryError &&
            messages.length === 0 && (

              <div
                className="
                  min-h-[320px]
                  flex flex-col
                  items-center
                  justify-center
                  text-center
                  px-4
                "
              >

                <div
                  className="
                    size-14 rounded-2xl
                    bg-gradient-to-br
                    from-accent/20
                    to-purple-500/10
                    border border-accent/25
                    flex items-center justify-center
                    mb-4
                    shadow-[0_0_30px_rgba(99,102,241,0.10)]
                  "
                >
                  <Sparkles
                    size={24}
                    className="text-accent-light"
                  />
                </div>

                <h2 className="text-heading font-semibold text-lg">
                  Explore your analyzed codebase
                </h2>

                <p
                  className="
                    text-muted text-sm
                    max-w-md
                    mt-2
                    leading-relaxed
                  "
                >
                  Ask about the repository health, dependencies,
                  API endpoints, risks, technical debt, languages,
                  findings, or overall architecture.
                </p>

                {analysis && (
                  <div
                    className="
                      flex flex-wrap
                      justify-center
                      gap-2
                      mt-5
                    "
                  >

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[10px] text-muted">
                      <Activity size={11} />
                      Health {analysis.healthScore ?? 0}/100
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[10px] text-muted">
                      <Package size={11} />
                      {analysis.dependencyCount ?? 0} dependencies
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[10px] text-muted">
                      <GitBranch size={11} />
                      {analysis.apiEndpointCount ?? 0} APIs
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[10px] text-muted">
                      <ShieldAlert size={11} />
                      {analysis.riskLevel || 'Unknown'} risk
                    </span>

                  </div>
                )}

              </div>

            )}


          {/* MESSAGES */}

          {messages.map((m) => (

            <div
              key={m.id}
              className={cn(
                'flex gap-3 sm:gap-4',
                m.role === 'user'
                  ? 'justify-end'
                  : 'justify-start',
              )}
            >

              {m.role === 'assistant' && (

                <div className="shrink-0 pt-1">

                  <div
                    className="
                      size-9 rounded-xl
                      bg-gradient-to-br
                      from-accent/20
                      to-purple-500/10
                      border border-accent/25
                      flex items-center justify-center
                    "
                  >
                    <Sparkles
                      size={15}
                      className="text-accent-light"
                    />
                  </div>

                </div>

              )}


              <div
                className={cn(
                  'max-w-3xl',
                  m.role === 'user' &&
                    'order-first',
                )}
              >

                <div
                  className={cn(
                    'flex items-center gap-2 mb-1.5',
                    m.role === 'user'
                      ? 'justify-end'
                      : 'justify-start',
                  )}
                >

                  {m.role === 'user' ? (

                    <>
                      <span className="text-[10px] text-muted">
                        You
                      </span>

                      <User
                        size={11}
                        className="text-muted"
                      />
                    </>

                  ) : (

                    <>
                      <span className="text-[10px] font-medium text-accent-light">
                        Decode AI
                      </span>

                      <span className="text-[10px] text-muted">
                        {m.timestamp}
                      </span>
                    </>

                  )}

                </div>


                <div
                  className={cn(
                    `
                      rounded-2xl
                      px-4 sm:px-5
                      py-3.5
                      border
                      transition-all duration-200
                    `,
                    m.role === 'user'
                      ? `
                        bg-accent
                        border-accent
                        text-white
                        rounded-tr-md
                        shadow-[0_4px_20px_rgba(99,102,241,0.15)]
                      `
                      : `
                        bg-surface-raised
                        border-border
                        text-body
                        rounded-tl-md
                      `,
                  )}
                >

                  <p
                    className="
                      text-sm
                      leading-7
                      whitespace-pre-wrap
                    "
                  >
                    {m.content}
                  </p>


                  {/* RELATED FILES */}

                  {m.relatedFiles &&
                    m.relatedFiles.length > 0 && (

                      <div
                        className="
                          mt-4 pt-3.5
                          border-t border-border/60
                        "
                      >

                        <div
                          className="
                            flex items-center gap-1.5
                            text-[10px]
                            uppercase
                            tracking-wider
                            font-semibold
                            text-muted
                            mb-2.5
                          "
                        >
                          <FileCode size={11} />
                          Related files
                        </div>

                        <div className="grid gap-1.5">

                          {m.relatedFiles.map(
                            (file) => (

                              <div
                                key={file}
                                className="
                                  w-full
                                  flex items-center gap-2
                                  rounded-lg
                                  border border-border/70
                                  bg-surface
                                  px-3 py-2
                                "
                              >

                                <div
                                  className="
                                    size-6 shrink-0
                                    rounded-md
                                    bg-accent/10
                                    flex items-center justify-center
                                  "
                                >
                                  <FileCode
                                    size={12}
                                    className="text-accent-light"
                                  />
                                </div>

                                <span
                                  className="
                                    text-xs
                                    font-mono
                                    text-accent-light
                                    truncate
                                  "
                                >
                                  {file}
                                </span>

                              </div>

                            ),
                          )}

                        </div>

                      </div>

                    )}

                </div>

              </div>


              {m.role === 'user' && (

                <div className="shrink-0 pt-6">

                  <div
                    className="
                      size-8 rounded-lg
                      bg-surface-raised
                      border border-border
                      flex items-center justify-center
                    "
                  >
                    <User
                      size={14}
                      className="text-muted"
                    />
                  </div>

                </div>

              )}

            </div>

          ))}


          {/* THINKING */}

          {loading && (

            <div className="flex gap-3 sm:gap-4">

              <div
                className="
                  size-9 shrink-0 rounded-xl
                  bg-accent/10
                  border border-accent/25
                  flex items-center justify-center
                "
              >
                <Sparkles
                  size={15}
                  className="text-accent-light animate-pulse"
                />
              </div>

              <div>

                <div className="flex items-center gap-2 mb-1.5">

                  <span className="text-[10px] font-medium text-accent-light">
                    Decode AI
                  </span>

                  <span className="text-[10px] text-muted">
                    analyzing repository
                  </span>

                </div>

                <div
                  className="
                    bg-surface-raised
                    border border-border
                    rounded-2xl rounded-tl-md
                    px-5 py-4
                  "
                >

                  <div className="flex items-center gap-2">

                    <Zap
                      size={13}
                      className="text-accent-light"
                    />

                    <span className="text-xs text-muted">
                      Analyzing current repository data
                    </span>

                    <div className="flex gap-1 ml-1">

                      {[0, 1, 2].map(
                        (i) => (

                          <span
                            key={i}
                            className="
                              size-1.5
                              rounded-full
                              bg-accent
                              animate-bounce
                            "
                            style={{
                              animationDelay: `${i * 150}ms`,
                            }}
                          />

                        ),
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>


        {/* SUGGESTIONS */}

        {showSuggestions && (

          <div
            className="
              px-4 sm:px-6 lg:px-8
              pb-5
            "
          >

            <div className="flex items-center gap-2 mb-3">

              <MessageSquare
                size={12}
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
                Questions from current analysis
              </span>

            </div>


            {suggestedQuestions.length > 0 ? (

              <div className="flex flex-wrap gap-2">

                {suggestedQuestions.map(
                  (question) => (

                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        send(question)
                      }
                      disabled={loading}
                      className="
                        group
                        flex items-center gap-2
                        text-xs
                        text-body
                        border border-border
                        bg-surface-raised
                        rounded-xl
                        px-3 py-2
                        transition-all duration-200
                        hover:border-accent/40
                        hover:bg-accent/5
                        hover:text-heading
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >

                      <Sparkles
                        size={11}
                        className="
                          text-accent-light
                          transition-transform
                          group-hover:rotate-12
                        "
                      />

                      {question}

                    </button>

                  ),
                )}

              </div>

            ) : (

              <div
                className="
                  flex items-center gap-2
                  text-xs text-muted
                  rounded-lg
                  border border-border
                  bg-surface-raised/40
                  px-3 py-3
                "
              >
                <Database size={14} />

                Not enough repository analysis data to generate questions.

              </div>

            )}

          </div>

        )}


        {/* INPUT */}

        <div
          className="
            border-t border-border
            bg-surface-raised/30
            p-3 sm:p-4
          "
        >

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="
              flex items-center gap-2
              max-w-5xl mx-auto
              rounded-xl
              border border-border
              bg-surface
              px-2
              py-1.5
              transition-all duration-200
              focus-within:border-accent/50
              focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.06)]
            "
          >

            <div
              className="
                hidden sm:flex
                size-8 shrink-0
                items-center justify-center
                rounded-lg
                bg-accent/10
              "
            >
              <Sparkles
                size={14}
                className="text-accent-light"
              />
            </div>


            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              disabled={
                loading ||
                loadingRepository ||
                !repository
              }
              placeholder={
                repository
                  ? 'Ask anything about this repository…'
                  : 'Waiting for repository analysis…'
              }
              className="
                flex-1
                min-w-0
                bg-transparent
                px-2
                py-2.5
                text-sm
                text-heading
                placeholder:text-muted
                outline-none
                disabled:opacity-50
              "
            />


            <Button
              type="submit"
              disabled={
                loading ||
                loadingRepository ||
                !input.trim() ||
                !repository
              }
              className="
                shrink-0
                rounded-lg
                px-3 sm:px-4
              "
            >

              <Send size={14} />

              <span className="hidden sm:inline">
                Ask
              </span>

            </Button>

          </form>


          <p
            className="
              text-center
              text-[10px]
              text-muted
              mt-2
            "
          >
            Answers are generated from the latest repository analysis and detected source context.
          </p>

        </div>

      </Card>

    </div>
  );
}