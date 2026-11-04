import { type QueryClient, useMutation } from '@tanstack/react-query';

import type { CreateActivitySessionInput, WorkoutSession } from '@gym-bro/shared';

import { createActivitySession } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

export const CREATE_ACTIVITY_SESSION_KEY = ['workout-sessions', 'create-activity'] as const;

// Registered on the QueryClient so an activity logged offline is sent when the
// connection returns, even after a restart. Activities have no planned link, so only
// history and stats (the rating-trend chart) need refreshing.
export function registerActivitySessionMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(CREATE_ACTIVITY_SESSION_KEY, {
    mutationFn: (input: CreateActivitySessionInput) => createActivitySession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateActivitySession() {
  return useMutation<WorkoutSession, Error, CreateActivitySessionInput>({
    mutationKey: CREATE_ACTIVITY_SESSION_KEY,
  });
}
