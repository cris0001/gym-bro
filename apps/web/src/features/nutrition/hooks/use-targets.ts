import { queryOptions, useQuery } from '@tanstack/react-query';

import type { NutritionTarget } from '@gym-bro/shared';

import { listTargets } from '../api/targets';

// Query-key factory for nutrition targets. Setting a target invalidates
// targetKeys.all so both the current target and the history refresh.
export const targetKeys = {
  all: ['nutrition', 'targets'] as const,
  current: () => [...targetKeys.all, 'current'] as const,
  history: () => [...targetKeys.all, 'history'] as const,
};

export function targetHistoryQueryOptions() {
  return queryOptions<NutritionTarget[]>({
    queryKey: targetKeys.history(),
    queryFn: listTargets,
  });
}

export function useTargets() {
  return useQuery(targetHistoryQueryOptions());
}
