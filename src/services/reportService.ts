import type { Report } from '@/types';
import { API_BASE_URL } from './api';

export interface ReportsResponse {
  ok: boolean;
  available?: boolean;
  reports?: Report[];
  message?: string;
}

// Contract: GET /repositories/:id/reports — reports are assembled
// live from the repository's current analysis, since no report
// history is persisted anywhere in this project.
export async function listReports(
  repositoryId: string,
): Promise<ReportsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${encodeURIComponent(repositoryId)}/reports`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load reports');
  }

  return data;
}

// generateReport is intentionally not implemented yet: there is no
// backend report-generation/export pipeline (PDF/CSV, etc). Keeping
// this page limited to "view the current analysis as reports" rather
// than pretending a generate/export flow is real.
