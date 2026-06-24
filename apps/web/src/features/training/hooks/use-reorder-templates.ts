import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { PlanWithTemplates, WorkoutTemplate } from '@gym-bro/shared';

import { reorderTemplates } from '../api/templates';
import { planKeys } from './use-plans';

interface ReorderTemplatesVars {
  planId: string;
  orderedIds: string[];
}

// Reorders a plan's templates with an optimistic cache update so drag-and-drop
// feels instant: the plan-detail cache is reordered on mutate, rolled back on
// error, and reconciled with the server on settle.
export function useReorderTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, orderedIds }: ReorderTemplatesVars) =>
      reorderTemplates(planId, orderedIds),
    onMutate: async ({ planId, orderedIds }) => {
      const key = planKeys.detail(planId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PlanWithTemplates>(key);
      if (previous) {
        const byId = new Map(previous.templates.map((t) => [t.id, t]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((t): t is WorkoutTemplate => t !== undefined);
        queryClient.setQueryData<PlanWithTemplates>(key, { ...previous, templates: reordered });
      }
      return { previous, planId };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(planKeys.detail(context.planId), context.previous);
      }
    },
    onSettled: (_data, _error, { planId }) => {
      void queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
  });
}
