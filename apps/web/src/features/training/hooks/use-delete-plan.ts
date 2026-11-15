import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePlan } from '../api/plans';
import { planKeys } from './use-plans';
import { activePlanKeys } from './use-active-plan';
import { templateKeys } from './use-template';

// Hard-deletes a plan (cascades to its templates), then invalidates plan
// queries so it disappears from the list.
export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
      void queryClient.invalidateQueries({ queryKey: activePlanKeys.all });
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
      // Sessions feature's root key — its templates’ planned sessions go with it.
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
