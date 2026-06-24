import { queryOptions, useQuery } from '@tanstack/react-query';

import type { TrainingPlan } from '@gym-bro/shared';

import { getActivePlan } from '../api/active-plan';

// The active plan is a single pointer, so one key holds it; the set mutation
// invalidates it.
export const activePlanKeys = {
  all: ['training', 'active-plan'] as const,
};

export function activePlanQueryOptions() {
  return queryOptions<TrainingPlan | null>({
    queryKey: activePlanKeys.all,
    queryFn: getActivePlan,
  });
}

export function useActivePlan() {
  return useQuery(activePlanQueryOptions());
}
