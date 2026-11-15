import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteExercise } from '../api/exercises';
import { exerciseKeys } from './use-exercises';
import { templateKeys } from './use-template';

// Soft-deletes an exercise, then invalidates every cached exercise list so it
// disappears from all category filters.
export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
      // Sessions feature's root key — workouts and exercise history show the exercise name.
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
      // Stats feature's root key — the exercise picker lists names.
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
