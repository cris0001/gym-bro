import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Exercise, ExerciseCategory } from '@gym-bro/shared';

import { listExercises } from '../api/exercises';

// Query-key factory for exercises. Mutations invalidate `exerciseKeys.all` to
// refresh every filtered list at once; each filtered list caches under its own
// category so switching the filter doesn't refetch already-seen categories.
export const exerciseKeys = {
  all: ['training', 'exercises'] as const,
  list: (category?: ExerciseCategory) => [...exerciseKeys.all, category ?? 'all'] as const,
};

export function exercisesQueryOptions(category?: ExerciseCategory) {
  return queryOptions<Exercise[]>({
    queryKey: exerciseKeys.list(category),
    queryFn: () => listExercises(category),
  });
}

export function useExercises(category?: ExerciseCategory) {
  return useQuery(exercisesQueryOptions(category));
}
