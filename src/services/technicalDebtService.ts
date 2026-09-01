import type { TechnicalDebtFinding } from '@/types';

export type { TechnicalDebtFinding };

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface TechnicalDebtCategoryCount {
  category: string;
  count: number;
}

export interface TechnicalDebtResponse {
  ok: boolean;
  available?: boolean;
  technicalDebtPercent?: number;
  byCategory?: TechnicalDebtCategoryCount[];
  issues?: TechnicalDebtFinding[];
  message?: string;
}

export async function getTechnicalDebt(
  repositoryId: string,
): Promise<TechnicalDebtResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${encodeURIComponent(repositoryId)}/technical-debt`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load technical debt');
  }

  return data;
}
