import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateStrengthSessionInput } from '@gym-bro/shared';

import { createStrengthSession } from '../api/workout-sessions';
import { plannedSessionKeys } from './use-planned-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Finishes a strength workout, then refreshes history. Also invalidates the
// calendar: if this fulfilled a planned session, that entry is now completed.
export function useCreateStrengthSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStrengthSessionInput) => createStrengthSession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
    },
  });
}
