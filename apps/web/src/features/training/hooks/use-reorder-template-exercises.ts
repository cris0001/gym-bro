import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TemplateExerciseWithExercise, TemplateWithExercises } from '@gym-bro/shared';

import { reorderTemplateExercises } from '../api/template-exercises';
import { templateKeys } from './use-template';

interface ReorderTemplateExercisesVars {
  templateId: string;
  orderedIds: string[];
}

// Reorders a template's exercises with an optimistic cache update so drag-and-
// drop feels instant: the template-detail cache is reordered on mutate, rolled
// back on error, and reconciled with the server on settle.
export function useReorderTemplateExercises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, orderedIds }: ReorderTemplateExercisesVars) =>
      reorderTemplateExercises(templateId, orderedIds),
    onMutate: async ({ templateId, orderedIds }) => {
      const key = templateKeys.detail(templateId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TemplateWithExercises>(key);
      if (previous) {
        const byId = new Map(previous.exercises.map((e) => [e.id, e]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((e): e is TemplateExerciseWithExercise => e !== undefined);
        queryClient.setQueryData<TemplateWithExercises>(key, { ...previous, exercises: reordered });
      }
      return { previous, templateId };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(templateKeys.detail(context.templateId), context.previous);
      }
    },
    onSettled: (_data, _error, { templateId }) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}
