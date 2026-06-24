import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdatePlannedSessionInput } from '@gym-bro/shared';

import { updatePlannedSession } from '../api/planned-sessions';
import { plannedSessionKeys } from './use-planned-sessions';

// Skips/unskips or reschedules a calendar entry, then invalidates the calendar.
export function useUpdatePlannedSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlannedSessionInput }) =>
      updatePlannedSession(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
    },
  });
}
