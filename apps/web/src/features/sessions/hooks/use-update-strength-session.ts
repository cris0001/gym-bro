import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateStrengthSessionInput, WorkoutSessionDetail } from '@gym-bro/shared';

import { updateStrengthSession } from '../api/workout-sessions';
import { exerciseHistoryKeys } from './use-exercise-history';
import { workoutSessionKeys } from './use-workout-sessions';

// Saves a full edit of a finished strength workout. The response is the refreshed
// detail, so we seed the detail cache, refresh the history lists, and invalidate
// per-exercise history (changed sets affect "previous" panels elsewhere).
export function useUpdateStrengthSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStrengthSessionInput }) =>
      updateStrengthSession(id, input),
    onSuccess: (detail, { id }) => {
      queryClient.setQueryData<WorkoutSessionDetail>(workoutSessionKeys.detail(id), detail);
      void queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: exerciseHistoryKeys.all });
    },
  });
}
