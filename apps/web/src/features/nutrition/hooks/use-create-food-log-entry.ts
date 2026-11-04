import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { createFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

// Each mutate() is one user action ("add this"), so it gets its own client id —
// stamped onto the variables BEFORE the mutation starts, which TanStack Query then
// reuses for every automatic retry of that action. The server dedupes on it, so a
// retry after a lost response can't log the same food twice.
function withClientId(input: CreateFoodLogInput): CreateFoodLogInput {
  return input.id ? input : { ...input, id: crypto.randomUUID() };
}

export function useCreateFoodLogEntry() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
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

  return {
    ...mutation,
    mutate: (...[input, options]: Parameters<typeof mutation.mutate>) =>
      mutation.mutate(withClientId(input), options),
    mutateAsync: (...[input, options]: Parameters<typeof mutation.mutateAsync>) =>
      mutation.mutateAsync(withClientId(input), options),
  };
}
