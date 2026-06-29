import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import type { ExerciseProgressPoint, RatingTrendPoint, StatExercise } from '@gym-bro/shared';

import {
  getExerciseProgress,
  getRatingTrend,
  getStatExercises,
  type StatsRange,
} from '../api/stats';

// Query-key factory for the training-stats domain. Each (exercise, range) and
// (range) window caches separately; null bounds keep keys stable for all-history.
export const statsKeys = {
  all: ['stats'] as const,
  exercises: () => [...statsKeys.all, 'exercises'] as const,
  progress: (exerciseId: string | null, range: StatsRange | undefined) =>
    [...statsKeys.all, 'progress', exerciseId, range?.from ?? null, range?.to ?? null] as const,
  ratingTrend: (range: StatsRange | undefined) =>
    [...statsKeys.all, 'rating-trend', range?.from ?? null, range?.to ?? null] as const,
};

export function statExercisesQueryOptions() {
  return queryOptions<StatExercise[]>({
    queryKey: statsKeys.exercises(),
    queryFn: getStatExercises,
  });
}

// exerciseId null = nothing picked yet, so the query stays disabled (no fetch).
// The queryFn narrows the null away — it only runs when enabled.
export function exerciseProgressQueryOptions(exerciseId: string | null, range?: StatsRange) {
  return queryOptions<ExerciseProgressPoint[]>({
    queryKey: statsKeys.progress(exerciseId, range),
    queryFn: () => {
      if (exerciseId === null) throw new Error('exerciseId is required');
      return getExerciseProgress(exerciseId, range);
    },
    enabled: exerciseId !== null,
    placeholderData: keepPreviousData,
  });
}

export function ratingTrendQueryOptions(range?: StatsRange) {
  return queryOptions<RatingTrendPoint[]>({
    queryKey: statsKeys.ratingTrend(range),
    queryFn: () => getRatingTrend(range),
  });
}

export function useStatExercises() {
  return useQuery(statExercisesQueryOptions());
}

export function useExerciseProgress(exerciseId: string | null, range?: StatsRange) {
  return useQuery(exerciseProgressQueryOptions(exerciseId, range));
}

export function useRatingTrend(range?: StatsRange) {
  return useQuery(ratingTrendQueryOptions(range));
}
