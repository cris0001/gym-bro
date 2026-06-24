import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreatePlannedSessionInput } from '@gym-bro/shared';

import { createPlannedSession } from '../api/planned-sessions';
import { plannedSessionKeys } from './use-planned-sessions';

// Assigns a template to a date, then invalidates the calendar so the new entry
// appears in whatever window is showing.
export function useCreatePlannedSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlannedSessionInput) => createPlannedSession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
    },
  });
}
