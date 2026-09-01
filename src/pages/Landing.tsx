import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileSearch,
  GitBranch,
  Github,
  Network,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Waypoints,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Insights', href: '#insights' },
];

const features = [
  {
    icon: FileSearch,
    title: 'Repository Intelligence',
    description:
      'Scan your codebase and turn thousands of files into a clear technical overview.',
  },
  {
    icon: Network,
    title: 'Architecture Visibility',
    description:
      'Understand how your codebase is structured before making changes.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Detection',
    description:
      'Surface security, complexity, maintainability, and technical debt concerns.',
  },
  {
    icon: Waypoints,
    title: 'API Discovery',
    description:
      'Automatically detect API endpoints across supported backend frameworks.',
  },
  {
    icon: Braces,
    title: 'Dependency Analysis',
    description:
      'Inspect project dependencies and understand the technologies inside your repository.',
  },
  {
    icon: Radar,
    title: 'Actionable Findings',
    description:
      'Locate issues with severity, source files, and line-level context.',
  },
];

const workflow = [
  {
    step: '01',
    icon: Github,
    title: 'Connect',
    description:
      'Choose a GitHub repository you want to understand.',
  },
  {
    step: '02',
    icon: Search,
    title: 'Analyze',
    description:
      'Decode.IC scans files, languages, APIs, dependencies, and code patterns.',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'Understand',
    description:
      'Explore code health, technical risks, findings, and repository insights.',
  },
];

const findings = [
  {
    severity: 'HIGH',
    title: 'Potential hardcoded secret',
    file: 'backend/config.js',
    line: '24',
    description: 'Sensitive credential pattern detected in source code.',
    color: 'danger',
  },
  {
    severity: 'MEDIUM',
    title: 'Deep nesting complexity',
    file: 'services/analysis.js',
    line: '82',
    description: 'High nesting depth may affect maintainability.',
    color: 'warning',
  },
  {
    severity: 'LOW',
    title: 'Pending TODO item',
    file: 'components/Header.tsx',
    line: '41',
    description: 'Unresolved implementation note found in the codebase.',
    color: 'accent',
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const analyzeHref = isAuthenticated ? '/repositories/new' : '/login';

  return (
    <div className="min-h-screen overflow-hidden bg-base text-body">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute right-[-300px] top-[900px] h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border-subtle bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-accent/30 bg-accent/10 shadow-glow transition group-hover:bg-accent/20">
              <Code2 size={18} className="text-accent-light" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-heading">
                Decode<span className="text-accent-light">.IC</span>
              </span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted">
                Code Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-heading"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={analyzeHref}
              className="group flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent/90"
            >
              Analyze Repository
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* HERO */}
        <section
          id="product"
          className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center px-6 pb-20 pt-32 lg:px-8"
        >
          <div className="absolute top-[140px] h-[1px] w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs text-accent-light">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Intelligent Repository Analysis
          </div>

          {/* Heading */}
          <h1 className="max-w-[950px] text-center text-5xl font-bold leading-[1.08] tracking-[-0.04em] text-heading sm:text-6xl lg:text-7xl">
            Understand your codebase
            <br />
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              before you change it.
            </span>
          </h1>

          <p className="mt-7 max-w-[680px] text-center text-base leading-7 text-muted sm:text-lg">
            Decode.IC analyzes your software repository to reveal code health,
            dependencies, APIs, technical risks, and actionable insights — so
            you can make changes with confidence.
          </p>

          {/* Hero actions */}
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to={analyzeHref}
              className="group flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent/90"
            >
              <Github size={17} />
              Analyze Your Repository
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface/40 px-6 py-3.5 text-sm font-semibold text-heading transition hover:border-accent/40 hover:bg-surface"
            >
              Explore Platform
              <ChevronRight size={16} />
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 size={13} className="text-success" />
            Connect. Analyze. Understand.
          </p>

          {/* PRODUCT PREVIEW */}
          <div className="relative mt-16 w-full max-w-[1100px]">
            <div className="absolute -inset-8 rounded-[40px] bg-accent/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              {/* Browser top */}
              <div className="flex h-12 items-center gap-4 border-b border-border bg-surface-sunken px-4">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-danger/50" />
                  <span className="size-2.5 rounded-full bg-warning/50" />
                  <span className="size-2.5 rounded-full bg-success/50" />
                </div>

                <div className="mx-auto flex items-center gap-2 rounded-md border border-border-subtle bg-base px-4 py-1.5">
                  <div className="size-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[10px] text-muted">
                    decode.ic / repository / AmazonClone
                  </span>
                </div>

                <div className="w-12" />
              </div>

              <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[220px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-border bg-surface-sunken p-4 lg:block">
                  <div className="mb-7 flex items-center gap-2 px-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-accent/15">
                      <Code2 size={14} className="text-accent-light" />
                    </div>
                    <span className="text-xs font-semibold text-heading">
                      Decode.IC
                    </span>
                  </div>

                  <div className="space-y-1">
                    {[
                      'Overview',
                      'Architecture',
                      'Dependencies',
                      'API Endpoints',
                      'Code Findings',
                      'Technical Debt',
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs ${index === 0
                            ? 'bg-accent/10 text-accent-light'
                            : 'text-muted'
                          }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${index === 0 ? 'bg-accent' : 'bg-border'
                            }`}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Dashboard */}
                <div className="bg-base p-5 sm:p-7">
                  <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs text-muted">Repository Overview</p>
                      <h3 className="mt-1 text-lg font-semibold text-heading">
                        skylineresearchworks / AmazonClone
                      </h3>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-md border border-success/20 bg-success/5 px-3 py-2 text-xs text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      Analysis Complete
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricCard
                      label="Health Score"
                      value="84"
                      suffix="/100"
                      accent="success"
                    />
                    <MetricCard
                      label="Technical Debt"
                      value="12"
                      suffix="%"
                      accent="warning"
                    />
                    <MetricCard
                      label="Risk Level"
                      value="Medium"
                      accent="accent"
                    />
                    <MetricCard
                      label="Files Analyzed"
                      value="116"
                      accent="heading"
                    />
                  </div>

                  {/* Main insight grid */}
                  <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                    {/* Architecture */}
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-heading">
                            Codebase Structure
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            High-level repository composition
                          </p>
                        </div>
                        <GitBranch size={17} className="text-accent-light" />
                      </div>

                      <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-base">
                        <div className="absolute h-full w-full bg-[linear-gradient(rgba(51,65,85,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.12)_1px,transparent_1px)] bg-[size:24px_24px]" />

                        <div className="relative flex items-center gap-4">
                          <Node label="Frontend" />
                          <div className="h-px w-8 bg-accent/50" />
                          <Node label="API" active />
                          <div className="h-px w-8 bg-accent/50" />
                          <Node label="Database" />
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-heading">
                          Languages
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Repository composition
                        </p>
                      </div>

                      <div className="space-y-4">
                        <LanguageBar label="JavaScript" value={48} />
                        <LanguageBar label="TypeScript" value={27} />
                        <LanguageBar label="CSS" value={15} />
                        <LanguageBar label="Other" value={10} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SmallStat label="Dependencies" value="42" />
                    <SmallStat label="API Endpoints" value="18" />
                    <SmallStat label="Components" value="27" />
                    <SmallStat label="Findings" value="8" danger />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="relative border-y border-border-subtle bg-surface-sunken/50 px-6 py-24 lg:px-8"
        >
          <div className="mx-auto max-w-[1100px]">
            <SectionHeading
              eyebrow="How it works"
              title="From repository to understanding."
              description="A focused workflow designed to help developers quickly understand unfamiliar or complex codebases."
            />

            <div className="relative mt-16 grid gap-6 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent md:block" />

              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.step}
                    className="relative rounded-xl border border-border bg-surface/70 p-7 transition hover:-translate-y-1 hover:border-accent/30"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                        <Icon size={20} className="text-accent-light" />
                      </div>

                      <span className="font-mono text-xs text-muted">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-heading">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-[1100px]">
            <SectionHeading
              eyebrow="Codebase intelligence"
              title="See what your code is really telling you."
              description="Decode.IC turns repository-level analysis into structured technical insights."
            />

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-border bg-surface/40 p-6 transition duration-300 hover:border-accent/30 hover:bg-surface hover:shadow-card"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-base transition group-hover:border-accent/30 group-hover:bg-accent/10">
                      <Icon
                        size={19}
                        className="text-muted transition group-hover:text-accent-light"
                      />
                    </div>

                    <h3 className="mt-6 text-base font-semibold text-heading">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINDINGS */}
        <section
          id="insights"
          className="border-y border-border-subtle bg-surface-sunken/40 px-6 py-28 lg:px-8"
        >
          <div className="mx-auto grid max-w-[1100px] items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
                Actionable insights
              </span>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-heading sm:text-4xl">
                Don't just scan your code.
                <br />
                Know where to look.
              </h2>

              <p className="mt-6 max-w-[480px] text-base leading-7 text-muted">
                Findings are organized by severity and connected to specific
                files and lines, helping you move from a high-level problem to
                the exact place where it exists.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  'Security and maintainability signals',
                  'Severity-based prioritization',
                  'File and line-level context',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-body">
                    <CheckCircle2 size={17} className="text-success" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                to={analyzeHref}
                className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-accent-light transition hover:text-white"
              >
                Analyze your repository
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Findings panel */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-heading">
                    Analysis Findings
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Prioritized repository signals
                  </p>
                </div>

                <span className="rounded-md border border-border bg-base px-2.5 py-1 font-mono text-xs text-muted">
                  8 findings
                </span>
              </div>

              <div className="divide-y divide-border-subtle">
                {findings.map((finding) => (
                  <div
                    key={finding.title}
                    className="group px-5 py-5 transition hover:bg-surface-raised/40"
                  >
                    <div className="flex gap-4">
                      <span
                        className={`mt-1 inline-flex h-6 items-center rounded px-2 font-mono text-[10px] font-semibold ${finding.color === 'danger'
                            ? 'border border-danger/20 bg-danger/10 text-danger'
                            : finding.color === 'warning'
                              ? 'border border-warning/20 bg-warning/10 text-warning'
                              : 'border border-accent/20 bg-accent/10 text-accent-light'
                          }`}
                      >
                        {finding.severity}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="text-sm font-medium text-heading">
                            {finding.title}
                          </h4>

                          <span className="font-mono text-[10px] text-muted">
                            {finding.file}:{finding.line}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-muted">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-4">
                <button className="group flex items-center gap-2 text-xs font-medium text-accent-light transition hover:text-white">
                  View all findings
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative px-6 py-28 lg:px-8">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[130px]" />

          <div className="relative mx-auto flex max-w-[850px] flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs text-accent-light">
              <Zap size={13} />
              Start with the code you already have
            </span>

            <h2 className="mt-7 text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
              Stop guessing how your codebase works.
            </h2>

            <p className="mt-5 max-w-[620px] text-base leading-7 text-muted">
              Connect a repository, run an analysis, and get a structured view
              of the code behind your next decision.
            </p>

            <Link
              to={analyzeHref}
              className="group mt-9 flex items-center gap-2 rounded-md bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent/90"
            >
              Analyze Your Repository
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-border-subtle bg-surface-sunken px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
                <Code2 size={16} className="text-accent-light" />
              </div>

              <span className="text-sm font-semibold text-heading">
                Decode<span className="text-accent-light">.IC</span>
              </span>
            </Link>

            <p className="mt-4 max-w-[350px] text-sm leading-6 text-muted">
              Intelligent repository analysis for developers who need to
              understand complex code before changing it.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted">
            <h4 className="text-heading text-[11px] font-semibold tracking-[0.55px] uppercase">
              CONTACT
            </h4>

            <a
              href="mailto:skylineresearchwork@gmail.com"
              className="transition hover:text-heading"
            >
              skylineresearchwork@gmail.com
            </a>

            <a
              href="tel:+919360934641"
              className="transition hover:text-heading"
            >
              +91 93609 34641
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1280px] flex-col justify-between gap-3 border-t border-border-subtle pt-6 text-xs text-muted sm:flex-row">
          <p>© 2026 Decode.IC. All rights reserved.</p>
          <p>Codebase Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable visual components                                                 */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-[700px] text-center">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
        {eyebrow}
      </span>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-muted">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent: 'success' | 'warning' | 'accent' | 'heading';
}) {
  const colorMap = {
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent-light',
    heading: 'text-heading',
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[11px] font-medium text-muted">{label}</p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-mono text-xl font-semibold ${colorMap[accent]}`}>
          {value}
        </span>

        {suffix && (
          <span className="font-mono text-xs text-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 font-mono text-sm font-semibold ${danger ? 'text-danger' : 'text-heading'
          }`}
      >
        {value}
      </p>
    </div>
  );
}

function LanguageBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-body">{label}</span>
        <span className="font-mono text-[10px] text-muted">{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-base">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Node({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex min-w-[72px] flex-col items-center gap-2 rounded-md border px-3 py-3 ${active
          ? 'border-accent/50 bg-accent/10'
          : 'border-border bg-surface'
        }`}
    >
      <Code2
        size={15}
        className={active ? 'text-accent-light' : 'text-muted'}
      />

      <span
        className={`text-[9px] font-medium ${active ? 'text-accent-light' : 'text-body'
          }`}
      >
        {label}
      </span>
    </div>
  );
}