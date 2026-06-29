import { queryOptions, useQuery } from '@tanstack/react-query';

import type { NutritionTarget } from '@gym-bro/shared';

import { getCurrentTarget } from '../api/targets';
import { targetKeys } from './use-targets';

export function currentTargetQueryOptions() {
  return queryOptions<NutritionTarget | null>({
    queryKey: targetKeys.current(),
    queryFn: getCurrentTarget,
  });
}

export function useCurrentTarget() {
  return useQuery(currentTargetQueryOptions());
}
