import { queryOptions, useQuery } from '@tanstack/react-query';

import type { PlanListItem } from '@gym-bro/shared';

import { listPlans } from '../api/plans';

// Query-key factory for plans. Distinct `list` and `detail` segments under one
// `all` prefix, so mutations can invalidate `planKeys.all` to refresh both the
// list and any open detail in one call.
export const planKeys = {
  all: ['training', 'plans'] as const,
  list: () => [...planKeys.all, 'list'] as const,
  detail: (id: string) => [...planKeys.all, 'detail', id] as const,
};

export function plansQueryOptions() {
  return queryOptions<PlanListItem[]>({
    queryKey: planKeys.list(),
    queryFn: listPlans,
  });
}

export function usePlans() {
  return useQuery(plansQueryOptions());
}
