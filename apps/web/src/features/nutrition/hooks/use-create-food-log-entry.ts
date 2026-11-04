import { type QueryClient, useMutation } from '@tanstack/react-query';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { createFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

export const CREATE_FOOD_LOG_KEY = ['food-log', 'create'] as const;

// What a still-unsent entry shows in the diary (name + portion), carried with the
// mutation's variables so it survives an app restart along with the queued write.
// Stripped before the request — the server snapshots the real name and macros.
export interface FoodLogPreview {
  name: string;
  portion: string;
}

export type CreateFoodLogVariables = CreateFoodLogInput & { preview?: FoodLogPreview };

// Registered on the QueryClient (not in the hook) so a write queued offline can be
// replayed after a restart, when no component that queued it is mounted: TanStack
// Query finds the mutationFn and onSuccess by mutationKey.
export function registerFoodLogMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(CREATE_FOOD_LOG_KEY, {
    mutationFn: ({ preview: _preview, ...input }: CreateFoodLogVariables) =>
      createFoodLogEntry(input),
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

// Each mutate() is one user action ("add this"), so it gets its own client id —
// stamped onto the variables BEFORE the mutation starts, which TanStack Query then
// reuses for every automatic retry and for an offline replay. The server dedupes on
// it, so neither can log the same food twice.
function withClientId(variables: CreateFoodLogVariables): CreateFoodLogVariables {
  return variables.id ? variables : { ...variables, id: crypto.randomUUID() };
}

export function useCreateFoodLogEntry() {
  const mutation = useMutation<unknown, Error, CreateFoodLogVariables>({
    mutationKey: CREATE_FOOD_LOG_KEY,
  });

  return {
    ...mutation,
    mutate: (...[variables, options]: Parameters<typeof mutation.mutate>) =>
      mutation.mutate(withClientId(variables), options),
    mutateAsync: (...[variables, options]: Parameters<typeof mutation.mutateAsync>) =>
      mutation.mutateAsync(withClientId(variables), options),
  };
}
