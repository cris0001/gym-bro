import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { createFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

export function useCreateFoodLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFoodLogInput) => createFoodLogEntry(input),
    onSuccess: () => {
      // Refresh the diary days now, but only MARK the recent lists stale: refetching
      // them while the add view is open is wasted (its order is frozen anyway). The
      // add view refetches stale ones in the background when it closes.
      void queryClient.invalidateQueries({
        queryKey: foodLogKeys.all,
        predicate: (query) => query.queryKey[2] !== 'recent',
      });
      void queryClient.invalidateQueries({
        queryKey: foodLogKeys.recentAll,
        refetchType: 'none',
      });
    },
  });
}
