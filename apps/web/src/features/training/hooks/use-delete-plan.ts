import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePlan } from '../api/plans';
import { planKeys } from './use-plans';

// Hard-deletes a plan (cascades to its templates), then invalidates plan
// queries so it disappears from the list.
export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
