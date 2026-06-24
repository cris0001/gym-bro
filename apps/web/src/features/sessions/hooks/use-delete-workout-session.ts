import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteWorkoutSession } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Deletes a session, then removes its detail from the cache and refreshes the
// history lists.
export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkoutSession(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: workoutSessionKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
    },
  });
}
