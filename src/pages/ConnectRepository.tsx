import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Github } from 'lucide-react';

import { Button, Card, Input } from '@/components/primitives';

import {
  getGitHubRepositories,
  connectRepository,
  analyzeRepository,
} from '@/services/repositoryService';

import {
  initialAnalysisSteps,
  type AnalysisStep,
} from '@/services/analysisService';

import { cn } from '@/utils/cn';

type Stage =
  | 'connect'
  | 'choose'
  | 'configure'
  | 'progress';

type GitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  language: string | null;
  defaultBranch: string;
  stars: number;
  private: boolean;
};

export default function ConnectRepository() {
  const navigate = useNavigate();

  const [stage, setStage] =
    useState<Stage>('connect');

  const [githubOwner, setGithubOwner] =
    useState('');

  const [repositories, setRepositories] =
    useState<GitHubRepository[]>([]);

  const [selectedRepo, setSelectedRepo] =
    useState<GitHubRepository | null>(null);

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [isLoadingRepos, setIsLoadingRepos] =
    useState(false);

  const [connectError, setConnectError] =
    useState<string | null>(null);

  const [repoError, setRepoError] =
    useState<string | null>(null);

  const [branch, setBranch] =
    useState('main');

  const [excludedFolders, setExcludedFolders] =
    useState('node_modules, dist, .next');

  const [steps, setSteps] =
    useState<AnalysisStep[]>(
      initialAnalysisSteps.map((step) => ({
        ...step,
        status: 'pending',
        detail: undefined,
      }))
    );

  // ─────────────────────────────────────────────
  // Load GitHub repositories
  // ─────────────────────────────────────────────

  const loadRepositories = async () => {
    const owner = githubOwner.trim();

    if (!owner) {
      throw new Error(
        'Please enter your GitHub username'
      );
    }

    try {
      setIsLoadingRepos(true);
      setRepoError(null);

      const result =
        await getGitHubRepositories(owner);

      if (!result?.ok) {
        throw new Error(
          result?.message ||
            'Failed to fetch GitHub repositories'
        );
      }

      setRepositories(
        result.repositories || []
      );

      setStage('choose');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch GitHub repositories';

      setRepoError(message);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // ─────────────────────────────────────────────
  // Connect GitHub
  // ─────────────────────────────────────────────

  const handleConnectGitHub = async () => {
    if (!githubOwner.trim()) {
      setConnectError(
        'Please enter your GitHub username'
      );
      return;
    }

    try {
      setIsConnecting(true);
      setConnectError(null);

      await loadRepositories();
    } catch (error) {
      setConnectError(
        error instanceof Error
          ? error.message
          : 'Failed to connect GitHub'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Select repository
  // ─────────────────────────────────────────────

  const handleSelectRepository = (
    repo: GitHubRepository
  ) => {
    setSelectedRepo(repo);

    setBranch(
      repo.defaultBranch || 'main'
    );

    setRepoError(null);
  };

  // ─────────────────────────────────────────────
  // Update analysis step
  // ─────────────────────────────────────────────

  const updateStep = (
    stepId: string,
    status: AnalysisStep['status'],
    detail?: string
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status,
              detail,
            }
          : step
      )
    );
  };

  // ─────────────────────────────────────────────
  // Start Analysis
  // ─────────────────────────────────────────────

  const handleStartAnalysis = async () => {
    if (!selectedRepo) {
      return;
    }

    try {
      setStage('progress');

      setSteps(
        initialAnalysisSteps.map((step) => ({
          ...step,
          status: 'pending',
          detail: undefined,
        }))
      );

      // ─────────────────────────────────────────
      // STEP 1: Connect repository
      // ─────────────────────────────────────────

      updateStep(
        'connect',
        'active'
      );

      await connectRepository(
        selectedRepo.owner,
        selectedRepo.name
      );

      updateStep(
        'connect',
        'done',
        'Repository connected'
      );

      // ─────────────────────────────────────────
      // STEP 2: Start backend analysis
      // ─────────────────────────────────────────

      updateStep(
        'scan',
        'active',
        'Scanning repository files...'
      );

      const result =
        await analyzeRepository(
          String(selectedRepo.id),
          branch,
          excludedFolders
        );

      if (!result?.ok) {
        throw new Error(
          result?.message ||
            'Repository analysis failed'
        );
      }

      // ─────────────────────────────────────────
      // Remaining UI steps
      // ─────────────────────────────────────────

      updateStep(
        'scan',
        'done',
        'Repository files scanned'
      );

      updateStep(
        'detect',
        'active'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      updateStep(
        'detect',
        'done',
        'Languages detected'
      );

      updateStep(
        'structure',
        'active'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      updateStep(
        'structure',
        'done',
        'Structure graph built'
      );

      updateStep(
        'deps',
        'active'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      updateStep(
        'deps',
        'done',
        'Dependencies resolved'
      );

      updateStep(
        'ai',
        'active'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      updateStep(
        'ai',
        'done',
        'Insights ready'
      );

      // ─────────────────────────────────────────
      // Navigate to repository overview
      // ─────────────────────────────────────────

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      navigate(
        `/repositories/${encodeURIComponent(
          `${selectedRepo.owner}-${selectedRepo.name}`
        )}`
      );
    } catch (error) {
      console.error(
        'Repository analysis error:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Analysis failed';

      setSteps((prev) =>
        prev.map((step) =>
          step.status === 'active'
            ? {
                ...step,
                status: 'failed',
                detail: message,
              }
            : step
        )
      );
    }
  };

  // ─────────────────────────────────────────────
  // CONNECT SCREEN
  // ─────────────────────────────────────────────

  if (stage === 'connect') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-heading text-2xl font-semibold">
            Connect a Repository
          </h1>

          <p className="text-muted text-sm mt-1">
            Let Decode.ic build an intelligence
            profile for a new codebase.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {[
            'connect',
            'choose',
            'configure',
            'progress',
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'size-6 rounded-full flex items-center justify-center font-mono',
                  stage === step
                    ? 'bg-accent text-white'
                    : 'bg-surface-raised text-muted'
                )}
              >
                {index + 1}
              </div>

              {index < 3 && (
                <div className="flex-1 h-px bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="p-8 text-center">

          <Github
            size={32}
            className="mx-auto text-heading mb-4"
          />

          <h3 className="text-heading font-semibold mb-1.5">
            Connect your GitHub account
          </h3>

          <p className="text-muted text-sm mb-6">
            Enter your GitHub username to load
            repositories.
          </p>

          <Input
            value={githubOwner}
            onChange={(e) =>
              setGithubOwner(e.target.value)
            }
            placeholder="Enter your GitHub username"
            className="mb-4"
          />

          <Button
            disabled={
              isConnecting ||
              !githubOwner.trim()
            }
            onClick={handleConnectGitHub}
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Connecting…
              </span>
            ) : (
              'Connect GitHub'
            )}
          </Button>

          {connectError && (
            <p className="text-sm text-red-500 mt-3">
              {connectError}
            </p>
          )}

        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // CHOOSE REPOSITORY
  // ─────────────────────────────────────────────

  if (stage === 'choose') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-heading text-2xl font-semibold">
            Select Repository
          </h1>

          <p className="text-muted text-sm mt-1">
            Choose the GitHub repository you want
            Decode.ic to analyze.
          </p>
        </div>

        <Card className="divide-y divide-border">

          {isLoadingRepos && (
            <div className="p-8 text-center">
              <Loader2
                size={24}
                className="mx-auto animate-spin text-accent mb-3"
              />

              <p className="text-muted text-sm">
                Loading GitHub repositories…
              </p>
            </div>
          )}

          {!isLoadingRepos &&
            repositories.map((repo) => (
              <button
                key={repo.id}
                onClick={() =>
                  handleSelectRepository(repo)
                }
                className={cn(
                  'w-full flex items-center justify-between px-5 py-4 text-left',
                  'hover:bg-surface-raised transition-colors',
                  selectedRepo?.id === repo.id &&
                    'bg-accent/5'
                )}
              >
                <div className="min-w-0">

                  <div className="text-heading text-sm font-medium">
                    {repo.fullName}
                  </div>

                  {repo.description && (
                    <div className="text-muted text-xs mt-1 truncate">
                      {repo.description}
                    </div>
                  )}

                </div>

                <span className="text-muted text-xs font-mono ml-4 shrink-0">
                  {repo.language || 'Unknown'}
                </span>
              </button>
            ))}

          {!isLoadingRepos &&
            repositories.length === 0 &&
            !repoError && (
              <div className="p-8 text-center">
                <p className="text-muted text-sm">
                  No repositories found.
                </p>
              </div>
            )}

          {repoError && (
            <div className="p-5">
              <p className="text-sm text-red-500">
                {repoError}
              </p>
            </div>
          )}

          <div className="p-5 flex justify-end">
            <Button
              disabled={!selectedRepo}
              onClick={() =>
                setStage('configure')
              }
            >
              Continue
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // CONFIGURE
  // ─────────────────────────────────────────────

  if (stage === 'configure') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-heading text-2xl font-semibold">
            Configure Analysis
          </h1>

          <p className="text-muted text-sm mt-1">
            Choose the branch and folders to exclude
            from analysis.
          </p>
        </div>

        <Card className="p-6 space-y-5">

          <div>
            <label className="text-body text-xs font-medium mb-1.5 block">
              Repository
            </label>

            <div className="text-sm text-heading font-medium">
              {selectedRepo?.fullName}
            </div>

            {selectedRepo?.description && (
              <p className="text-muted text-xs mt-1">
                {selectedRepo.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-body text-xs font-medium mb-1.5 block">
              Branch to analyze
            </label>

            <Input
              value={branch}
              onChange={(e) =>
                setBranch(e.target.value)
              }
              placeholder="main"
            />
          </div>

          <div>
            <label className="text-body text-xs font-medium mb-1.5 block">
              Excluded folders
            </label>

            <Input
              value={excludedFolders}
              onChange={(e) =>
                setExcludedFolders(e.target.value)
              }
              placeholder="node_modules, dist, .next"
            />

            <p className="text-muted text-xs mt-1.5">
              Separate multiple folders with commas.
            </p>
          </div>

          <div className="flex justify-between pt-2">

            <Button
              variant="secondary"
              onClick={() =>
                setStage('choose')
              }
            >
              Back
            </Button>

            <Button
              disabled={
                !selectedRepo ||
                !branch.trim()
              }
              onClick={handleStartAnalysis}
            >
              Start Analysis
            </Button>

          </div>

        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ANALYSIS PROGRESS
  // ─────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-heading text-2xl font-semibold">
          Repository Analysis
        </h1>

        <p className="text-muted text-sm mt-1">
          Decode.ic is analyzing{' '}
          {selectedRepo?.fullName || 'repository'}.
        </p>
      </div>

      <Card className="p-6">

        <h3 className="text-heading font-semibold mb-5">
          Analyzing{' '}
          {selectedRepo?.fullName || 'repository'}…
        </h3>

        <div className="space-y-5">

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3"
            >

              {step.status === 'done' && (
                <Check
                  size={17}
                  className="text-success shrink-0"
                />
              )}

              {step.status === 'active' && (
                <Loader2
                  size={17}
                  className="text-accent shrink-0 animate-spin"
                />
              )}

              {step.status === 'pending' && (
                <div className="size-[17px] rounded-full border border-border shrink-0" />
              )}

              {step.status === 'failed' && (
                <div className="size-[17px] rounded-full bg-red-500 shrink-0" />
              )}

              <div className="flex-1">

                <div
                  className={cn(
                    'text-sm',
                    step.status === 'pending'
                      ? 'text-muted'
                      : step.status === 'failed'
                        ? 'text-red-500'
                        : 'text-body'
                  )}
                >
                  {step.label}
                </div>

                {step.detail && (
                  <div
                    className={cn(
                      'text-xs font-mono mt-0.5',
                      step.status === 'failed'
                        ? 'text-red-500'
                        : 'text-success'
                    )}
                  >
                    {step.detail}
                  </div>
                )}

              </div>
            </div>
          ))}

        </div>

      </Card>
    </div>
  );
}