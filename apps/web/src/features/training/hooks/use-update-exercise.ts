import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateExerciseInput } from '@gym-bro/shared';

import { updateExercise } from '../api/exercises';
import { exerciseKeys } from './use-exercises';

// Updates an exercise (rename/recategorize), then invalidates every cached
// exercise list so the change is reflected across all category filters.
export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExerciseInput }) =>
      updateExercise(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}
