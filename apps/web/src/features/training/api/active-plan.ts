import { apiFetch } from '@/lib/api-client';

import type { TrainingPlan } from '@gym-bro/shared';

// GET /api/active-plan — the plan shown by default, or null if none is set.
export function getActivePlan(): Promise<TrainingPlan | null> {
  return apiFetch<TrainingPlan | null>('/api/active-plan');
}

// PUT /api/active-plan — set the active plan, or pass null to clear it. Returns
// the new active plan (or null).
export function setActivePlan(activePlanId: string | null): Promise<TrainingPlan | null> {
  return apiFetch<TrainingPlan | null>('/api/active-plan', {
    method: 'PUT',
    body: JSON.stringify({ activePlanId }),
  });
}
