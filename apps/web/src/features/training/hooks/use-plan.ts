import { queryOptions, useQuery } from '@tanstack/react-query';

import type { PlanWithTemplates } from '@gym-bro/shared';

import { getPlan } from '../api/plans';
import { planKeys } from './use-plans';

// Detail query for a single plan (with its ordered templates embedded).
// Exported as queryOptions so a route loader can prefetch by id.
export function planQueryOptions(id: string) {
  return queryOptions<PlanWithTemplates>({
    queryKey: planKeys.detail(id),
    queryFn: () => getPlan(id),
  });
}

export function usePlan(id: string) {
  return useQuery(planQueryOptions(id));
}
