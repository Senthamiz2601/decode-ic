import type { DependencyManifest } from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface DependenciesResponse {
  ok: boolean;
  available?: boolean;
  dependencyCount?: number;
  manifests?: DependencyManifest[];
  message?: string;
}

export async function getDependencies(
  repositoryId: string,
): Promise<DependenciesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${encodeURIComponent(repositoryId)}/dependencies`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load dependencies');
  }

  return data;
}
