import { queryOptions, useQuery } from '@tanstack/react-query';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { getWorkoutSession } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Detail query for a single workout (performances + sets + tags). Exported as
// queryOptions so a route loader can prefetch by id.
export function workoutSessionQueryOptions(id: string) {
  return queryOptions<WorkoutSessionDetail>({
    queryKey: workoutSessionKeys.detail(id),
    queryFn: () => getWorkoutSession(id),
  });
}

// enabled gates the fetch so callers can defer it (e.g. the calendar panel only
// loads a workout's detail once its row is expanded).
export function useWorkoutSession(id: string, enabled = true) {
  return useQuery({ ...workoutSessionQueryOptions(id), enabled });
}
