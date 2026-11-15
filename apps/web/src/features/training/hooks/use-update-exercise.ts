import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateExerciseInput } from '@gym-bro/shared';

import { updateExercise } from '../api/exercises';
import { exerciseKeys } from './use-exercises';
import { templateKeys } from './use-template';

// Updates an exercise (rename/recategorize), then invalidates every cached
// exercise list so the change is reflected across all category filters.
export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExerciseInput }) =>
      updateExercise(id, input),
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
