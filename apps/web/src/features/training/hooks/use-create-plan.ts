import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreatePlanInput } from '@gym-bro/shared';

import { createPlan } from '../api/plans';
import { planKeys } from './use-plans';

// Creates a plan, then invalidates plan queries so the list reflects the new
// plan (and its template count).
export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => createPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
