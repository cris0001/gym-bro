import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { endOfWeek, format, startOfWeek } from 'date-fns';

import type { WorkoutHistoryPage } from '@gym-bro/shared';

import { listWorkoutSessions } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

const ISO = 'yyyy-MM-dd';
// A week's worth of workouts fits one page; cap generously and skip offset paging.
const WEEK_LIMIT = 100;

// Inclusive Monday–Sunday bounds for the week containing the given day.
export function weekRange(day: Date): { from: string; to: string } {
  return {
    from: format(startOfWeek(day, { weekStartsOn: 1 }), ISO),
    to: format(endOfWeek(day, { weekStartsOn: 1 }), ISO),
  };
}

export function workoutsByWeekQueryOptions(from: string, to: string) {
  return queryOptions<WorkoutHistoryPage>({
    queryKey: workoutSessionKeys.range(from, to),
    queryFn: () => listWorkoutSessions(WEEK_LIMIT, 0, from, to),
    placeholderData: keepPreviousData,
  });
}

export function useWorkoutsByWeek(from: string, to: string) {
  return useQuery(workoutsByWeekQueryOptions(from, to));
}
