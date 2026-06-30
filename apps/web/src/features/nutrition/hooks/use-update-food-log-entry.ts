import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateFoodLogInput } from '@gym-bro/shared';

import { updateFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

// Edit a diary entry (quantity and/or day). The server rescales the snapshotted
// macros, so the day total and the recent list refresh on invalidation.
export function useUpdateFoodLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFoodLogInput }) =>
      updateFoodLogEntry(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodLogKeys.all });
    },
  });
}
