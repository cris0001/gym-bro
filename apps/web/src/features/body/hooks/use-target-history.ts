import { queryOptions, useQuery } from '@tanstack/react-query';

import type { NutritionTarget } from '@gym-bro/shared';

import { listNutritionTargets } from '../api/targets';

// Target history for the body trend chart's calorie overlay. Body-owned key
// namespace (the nutrition feature invalidates its own ['nutrition','targets'] key
// on save); this refetches on its own staleness, which is fine for a cross-page
// read in a single-user app.
export const bodyTargetKeys = {
  all: ['body', 'target-history'] as const,
};

export function targetHistoryQueryOptions() {
  return queryOptions<NutritionTarget[]>({
    queryKey: bodyTargetKeys.all,
    queryFn: listNutritionTargets,
  });
}

export function useTargetHistory() {
  return useQuery(targetHistoryQueryOptions());
}
