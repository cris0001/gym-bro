import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePlannedSession } from '../api/planned-sessions';
import { plannedSessionKeys } from './use-planned-sessions';

// Removes a calendar entry, then invalidates the calendar.
export function useDeletePlannedSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlannedSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
    },
  });
}
