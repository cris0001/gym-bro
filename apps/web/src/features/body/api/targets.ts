import { apiFetch } from '@/lib/api-client';

import type { NutritionTarget } from '@gym-bro/shared';

// GET /api/nutrition-targets — full target history, oldest first. Read directly
// here rather than through the nutrition feature, so the body feature stays
// decoupled (features don't import each other). Used to overlay the target-calorie
// line on the body trend chart.
export function listNutritionTargets(): Promise<NutritionTarget[]> {
  return apiFetch<NutritionTarget[]>('/api/nutrition-targets');
}
