import { type QueryClient, useMutation } from '@tanstack/react-query';

import type { CreateStrengthSessionInput, WorkoutSession } from '@gym-bro/shared';

import { createStrengthSession } from '../api/workout-sessions';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { plannedSessionKeys } from './use-planned-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

export const CREATE_STRENGTH_SESSION_KEY = ['workout-sessions', 'create-strength'] as const;

// Registered on the QueryClient so a workout finished offline is sent once the
// connection returns — even after an app restart, when the finish sheet that queued
// it is gone. onSuccess refreshes history + the calendar (a fulfilled planned session
// is now completed) + stats, and clears the draft the workout came from: matched on
// its clientId, so a newer workout started meanwhile is never touched.
export function registerStrengthSessionMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(CREATE_STRENGTH_SESSION_KEY, {
    mutationFn: (input: CreateStrengthSessionInput) => createStrengthSession(input),
    onSuccess: (session: WorkoutSession) => {
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
      // Stats feature's root key — a finished workout is a new data point on the charts.
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      const { draft, discard } = useWorkoutDraftStore.getState();
      if (draft?.clientId !== undefined && draft.clientId === session.id) discard();
    },
  });
}

export function useCreateStrengthSession() {
  return useMutation<WorkoutSession, Error, CreateStrengthSessionInput>({
    mutationKey: CREATE_STRENGTH_SESSION_KEY,
  });
}
