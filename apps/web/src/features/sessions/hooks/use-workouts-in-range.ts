import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { endOfWeek, format, startOfWeek } from 'date-fns';

import type { WorkoutHistoryPage } from '@gym-bro/shared';

import { listWorkoutSessions } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

const ISO = 'yyyy-MM-dd';
// A bounded window (a week, or a month's calendar grid) fits one page; cap
// generously and skip offset paging.
const RANGE_LIMIT = 100;

// Inclusive Monday–Sunday bounds for the week containing the given day.
export function weekRange(day: Date): { from: string; to: string } {
  return {
    from: format(startOfWeek(day, { weekStartsOn: 1 }), ISO),
    to: format(endOfWeek(day, { weekStartsOn: 1 }), ISO),
  };
}

export function workoutsInRangeQueryOptions(from: string, to: string) {
  return queryOptions<WorkoutHistoryPage>({
    queryKey: workoutSessionKeys.range(from, to),
    queryFn: () => listWorkoutSessions(RANGE_LIMIT, 0, from, to),
    placeholderData: keepPreviousData,
  });
}

export function useWorkoutsInRange(from: string, to: string) {
  return useQuery(workoutsInRangeQueryOptions(from, to));
}
