import type { ImpactAnalysis, SimulationResult } from '@/types';
import { mockDelay } from './api';

// Contract (future): POST /repositories/:id/impact-analysis { target }
export async function runImpactAnalysis(target: string): Promise<ImpactAnalysis> {
  return mockDelay(
    {
      target: target || 'updateUserProfile()',
      targetType: 'function',
      impactScore: 82,
      directDependencies: ['UserRepository.save()', 'ProfileValidator.validate()', 'AuditLogger.record()'],
      indirectDependencies: ['NotificationService.notifyProfileChange()', 'SearchIndexer.reindexUser()'],
      affectedComponents: ['ProfileForm.tsx', 'AccountSettings.tsx', 'AdminUserEditor.tsx', 'OnboardingWizard.tsx'],
      affectedApis: ['PATCH /users/:id', 'GET /users/:id/profile'],
      databaseOperations: ['UPDATE users SET profile_json = $1 WHERE id = $2'],
      relatedTests: [
        'user_profile.spec.ts', 'profile_validator.spec.ts', 'account_settings.spec.tsx',
        'audit_logger.spec.ts', 'search_indexer.spec.ts', 'onboarding_wizard.spec.tsx',
        'api_users_patch.spec.ts', 'notification_service.spec.ts',
      ],
    } satisfies ImpactAnalysis,
    700,
  );
}

// Contract (future): POST /repositories/:id/simulate-change { description }
export async function simulateChange(description: string): Promise<SimulationResult> {
  return mockDelay(
    {
      description,
      affected: [
        'Authentication service', 'User model', 'Login component', 'Session manager',
        'API middleware', 'Protected routes', 'Database logic', 'Testing modules',
      ],
      estimatedRisk: 'high',
      migrationPlan: [
        'Update authentication provider configuration',
        'Modify authentication middleware to support the new flow',
        'Update session handling and token storage',
        'Update the frontend login flow and error states',
        'Re-verify protected route guards',
        'Update and extend the authentication test suite',
      ],
    } satisfies SimulationResult,
    900,
  );
}
