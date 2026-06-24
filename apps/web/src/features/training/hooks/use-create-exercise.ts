import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateExerciseInput } from '@gym-bro/shared';

import { createExercise } from '../api/exercises';
import { exerciseKeys } from './use-exercises';

// Creates an exercise, then invalidates every cached exercise list (all
// category filters) so the new row appears wherever it belongs.
export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => createExercise(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}
