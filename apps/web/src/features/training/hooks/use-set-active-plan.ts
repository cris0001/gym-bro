import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TrainingPlan } from '@gym-bro/shared';

import { setActivePlan } from '../api/active-plan';
import { activePlanKeys } from './use-active-plan';

// Sets (or clears with null) the active plan, then seeds the cache from the
// response — the returned plan is the new state, so no refetch is needed.
export function useSetActivePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activePlanId: string | null) => setActivePlan(activePlanId),
    onSuccess: (plan) => {
      queryClient.setQueryData<TrainingPlan | null>(activePlanKeys.all, plan);
    },
  });
}
