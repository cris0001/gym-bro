import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTemplateExercise } from '../api/template-exercises';
import { templateKeys } from './use-template';

// Removes an exercise from a template. templateId travels in the vars so the
// right template detail is invalidated.
export function useDeleteTemplateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; templateId: string }) => deleteTemplateExercise(id),
    onSuccess: (_data, { templateId }) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}
