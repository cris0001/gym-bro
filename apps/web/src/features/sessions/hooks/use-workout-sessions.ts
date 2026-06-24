import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import type { WorkoutHistoryPage } from '@gym-bro/shared';

import { listWorkoutSessions } from '../api/workout-sessions';

// Query-key factory for workout sessions: paginated lists under `list(limit,
// offset)` and single details under `detail(id)`. Mutations invalidate
// `lists()` (all pages) and/or a specific detail.
export const workoutSessionKeys = {
  all: ['sessions', 'workout'] as const,
  lists: () => [...workoutSessionKeys.all, 'list'] as const,
  list: (limit: number, offset: number) => [...workoutSessionKeys.lists(), limit, offset] as const,
  detail: (id: string) => [...workoutSessionKeys.all, 'detail', id] as const,
};

export function workoutSessionsQueryOptions(limit: number, offset: number) {
  return queryOptions<WorkoutHistoryPage>({
    queryKey: workoutSessionKeys.list(limit, offset),
    queryFn: () => listWorkoutSessions(limit, offset),
    // Keep the previous page visible while the next loads — no flicker on paging.
    placeholderData: keepPreviousData,
  });
}

export function useWorkoutSessions(limit: number, offset: number) {
  return useQuery(workoutSessionsQueryOptions(limit, offset));
}
