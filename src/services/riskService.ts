import type { Risk, RiskLevel } from '@/types';
import { API_BASE_URL } from './api';

export interface RisksResponse {
  ok: boolean;
  available?: boolean;
  riskLevel?: RiskLevel;
  risks?: Risk[];
  message?: string;
}

export async function getRisks(
  repositoryId: string,
): Promise<RisksResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${encodeURIComponent(repositoryId)}/risks`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load risks');
  }

  return data;
}
