import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateWorkoutSessionInput, WorkoutSessionDetail } from '@gym-bro/shared';

import { updateWorkoutSession } from '../api/workout-sessions';
import { workoutSessionKeys } from './use-workout-sessions';

// Edits a session's metadata/tags. The response is the refreshed detail, so we
// seed the detail cache from it and invalidate the history lists.
export function useUpdateWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkoutSessionInput }) =>
      updateWorkoutSession(id, input),
    onSuccess: (detail, { id }) => {
      queryClient.setQueryData<WorkoutSessionDetail>(workoutSessionKeys.detail(id), detail);
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
    },
  });
}
