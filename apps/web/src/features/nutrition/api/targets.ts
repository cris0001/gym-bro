import { apiFetch } from '@/lib/api-client';

import type { NutritionTarget, SetNutritionTargetInput } from '@gym-bro/shared';

// GET /api/nutrition-targets/current — the most recent target, or null if unset.
export function getCurrentTarget(): Promise<NutritionTarget | null> {
  return apiFetch<NutritionTarget | null>('/api/nutrition-targets/current');
}

// GET /api/nutrition-targets — the full history, oldest first.
export function listTargets(): Promise<NutritionTarget[]> {
  return apiFetch<NutritionTarget[]>('/api/nutrition-targets');
}

// PUT /api/nutrition-targets — set/change today's target (upsert on the date).
export function setTarget(input: SetNutritionTargetInput): Promise<NutritionTarget> {
  return apiFetch<NutritionTarget>('/api/nutrition-targets', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
