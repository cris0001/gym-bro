import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateTemplateExerciseInput } from '@gym-bro/shared';

import { updateTemplateExercise } from '../api/template-exercises';
import { templateKeys } from './use-template';

// Edits a template-exercise's targets. templateId travels in the vars (the
// endpoint is keyed by the row id) so the right template detail is invalidated.
export function useUpdateTemplateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      templateId: string;
      input: UpdateTemplateExerciseInput;
    }) => updateTemplateExercise(id, input),
    onSuccess: (_data, { templateId }) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}
