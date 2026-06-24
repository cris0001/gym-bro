import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteExercise } from '../api/exercises';
import { exerciseKeys } from './use-exercises';

// Soft-deletes an exercise, then invalidates every cached exercise list so it
// disappears from all category filters.
export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}
