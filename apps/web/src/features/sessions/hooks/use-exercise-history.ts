import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

import { getExerciseHistory } from '../api/exercise-history';

// Query-key factory for per-exercise history. Each (exercise, before, limit)
// window caches separately; growing the limit for "show more" reuses the prior
// window via keepPreviousData so the panel doesn't flash while loading.
export const exerciseHistoryKeys = {
  all: ['sessions', 'exercise-history'] as const,
  query: (exerciseId: string, before: string | undefined, limit: number) =>
    [...exerciseHistoryKeys.all, exerciseId, before ?? null, limit] as const,
};

export function exerciseHistoryQueryOptions(
  exerciseId: string,
  before: string | undefined,
  limit: number,
) {
  return queryOptions<ExerciseHistoryEntry[]>({
    queryKey: exerciseHistoryKeys.query(exerciseId, before, limit),
    queryFn: () => getExerciseHistory(exerciseId, before ? { before, limit } : { limit }),
    placeholderData: keepPreviousData,
  });
}

export function useExerciseHistory(exerciseId: string, before: string | undefined, limit: number) {
  return useQuery(exerciseHistoryQueryOptions(exerciseId, before, limit));
}
