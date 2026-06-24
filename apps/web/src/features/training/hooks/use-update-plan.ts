import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdatePlanInput } from '@gym-bro/shared';

import { updatePlan } from '../api/plans';
import { planKeys } from './use-plans';

// Updates a plan (rename/re-describe), then invalidates plan queries so both
// the list and any open detail reflect the change.
export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlanInput }) => updatePlan(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
