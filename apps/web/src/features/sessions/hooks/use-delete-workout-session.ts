import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteWorkoutSession } from '../api/workout-sessions';
import { exerciseHistoryKeys } from './use-exercise-history';
import { plannedSessionKeys } from './use-planned-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Deletes a session, then removes its detail from the cache and refreshes the
// history lists. Also refreshes the calendar (a deleted workout reverts its
// planned entry to 'planned' server-side) and per-exercise history panels.
export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkoutSession(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: workoutSessionKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: plannedSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: exerciseHistoryKeys.all });
    },
  });
}
