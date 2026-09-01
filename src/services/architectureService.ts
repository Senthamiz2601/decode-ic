const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export type ArchitectureNodeType =
  | 'frontend'
  | 'api'
  | 'service'
  | 'database'
  | 'external'
  | 'file';

export type ArchitectureRisk =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface ArchitectureNode {
  id: string;
  label: string;
  type: ArchitectureNodeType;
  layer: number;
  description?: string;
  risk: ArchitectureRisk;
  complexity?: string;
  dependencies?: number;
  dependents?: number;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  kind?: string;
}

export interface ArchitectureResponse {
  ok: boolean;
  architecture?: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
  message?: string;
}

export async function getArchitecture(
  repositoryId: string,
): Promise<ArchitectureResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${repositoryId}/architecture`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || 'Failed to load architecture',
    );
  }

  return data;
}