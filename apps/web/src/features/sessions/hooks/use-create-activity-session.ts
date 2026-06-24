import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateActivitySessionInput } from '@gym-bro/shared';

import { createActivitySession } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Logs an ad-hoc activity, then refreshes history. Activities have no planned
// link, so the calendar is unaffected.
export function useCreateActivitySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivitySessionInput) => createActivitySession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
    },
  });
}
