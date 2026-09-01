import type { Repository } from '@/types';

const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


// ─────────────────────────────────────────────
// GitHub: Get repositories for an owner
// GET /api/github/repositories/:owner
// ─────────────────────────────────────────────

export async function getGitHubRepositories(owner: string) {
  const response = await fetch(
    `${API_URL}/api/github/repositories/${encodeURIComponent(owner)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub repositories');
  }

  return response.json();
}


// ─────────────────────────────────────────────
// GitHub: Connect to a specific repository
// POST /api/repositories/connect
// ─────────────────────────────────────────────

export async function connectRepository(
  owner: string,
  repo: string
) {
  const response = await fetch(
    `${API_URL}/api/repositories/connect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner,
        repo,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to connect repository');
  }

  return response.json();
}


// ─────────────────────────────────────────────
// Repository: List connected repositories
// GET /api/repositories
// ─────────────────────────────────────────────

export async function listRepositories(): Promise<{
  ok: boolean;
  repositories: Repository[];
}> {
  const response = await fetch(
    `${API_URL}/api/repositories`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }

  return response.json();
}



// ─────────────────────────────────────────────
// Repository: Get single connected repository
// GET /api/repositories/:id
// ─────────────────────────────────────────────

export async function getRepository(id: string) {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch repository');
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Repository: Analyze repository
// POST /api/repositories/:id/analyze
// ─────────────────────────────────────────────

export async function analyzeRepository(
  id: string,
  branch: string,
  excludedFolders: string
) {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(
      id
    )}/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch,
        excludedFolders,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        'Failed to analyze repository'
    );
  }

  return result;
}

// ─────────────────────────────────────────────
// Repository: Re-analyze
// POST /api/repositories/:id/re-analyze
// ─────────────────────────────────────────────

export async function reanalyzeRepository(
  id: string
): Promise<{ ok: true }> {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(
      id
    )}/re-analyze`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to re-analyze repository');
  }

  return response.json();
}


// ─────────────────────────────────────────────
// Repository: File tree (real GitHub files for the analyzed branch)
// GET /api/repositories/:id/files
// ─────────────────────────────────────────────

export async function getRepositoryFileTree(id: string): Promise<{
  ok: boolean;
  message?: string;
  files: { path: string; sha: string; size: number }[];
  truncated: boolean;
}> {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(id)}/files`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || 'Failed to load repository files');
  }

  return result;
}

// ─────────────────────────────────────────────
// Repository: Single file content
// GET /api/repositories/:id/files/content?path=...
// ─────────────────────────────────────────────

export async function getRepositoryFileContent(
  id: string,
  path: string
): Promise<{
  ok: boolean;
  message?: string;
  path: string;
  content: string;
  language: string;
  lineCount: number;
  size: number;
}> {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(id)}/files/content?path=${encodeURIComponent(path)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || 'Failed to load file content');
  }

  return result;
}

// ─────────────────────────────────────────────
// Repository: Remove
// DELETE /api/repositories/:id
// ─────────────────────────────────────────────

export async function removeRepository(
  id: string
): Promise<{ ok: true }> {
  const response = await fetch(
    `${API_URL}/api/repositories/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove repository');
  }

  return response.json();
}