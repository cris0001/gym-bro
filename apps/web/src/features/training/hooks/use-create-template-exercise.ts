import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateTemplateExerciseInput } from '@gym-bro/shared';

import { createTemplateExercise } from '../api/template-exercises';
import { templateKeys } from './use-template';

// Adds an exercise to a template, then invalidates that template's detail so the
// builder refreshes.
export function useCreateTemplateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: CreateTemplateExerciseInput;
    }) => createTemplateExercise(templateId, input),
    onSuccess: (_data, { templateId }) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}
