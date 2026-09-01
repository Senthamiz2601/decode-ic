export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'failed';
  detail?: string;
}

// Contract (future): POST /repositories/analyze — this returns a job id and
// the UI polls GET /repositories/:id/analysis-status. For now we simulate
// the same step sequence locally.
export const initialAnalysisSteps: AnalysisStep[] = [
  { id: 'connect', label: 'Connecting to GitHub', status: 'pending' },
  { id: 'scan', label: 'Scanning files', status: 'pending' },
  { id: 'detect', label: 'Detecting languages', status: 'pending' },
  { id: 'structure', label: 'Building code structure', status: 'pending' },
  { id: 'deps', label: 'Analyzing dependencies', status: 'pending' },
  { id: 'ai', label: 'Generating AI insights', status: 'pending' },
];
