import { useMutationState } from '@tanstack/react-query';

import type { MealType } from '@gym-bro/shared';

import { CREATE_FOOD_LOG_KEY, type CreateFoodLogVariables } from './use-create-food-log-entry';

// Diary entries the user added that haven't reached the server yet: queued while
// offline (paused) or still being retried after a failure. Read straight from the
// mutation cache — which is persisted — so they stay visible across an app restart
// until they sync. A normal online add (in flight for a few hundred ms) is left out,
// so a quick add never flashes a "waiting" row before the real entry appears.
export function usePendingFoodLogEntries(loggedDate: string, meal: MealType) {
  const pending = useMutationState({
    filters: {
      mutationKey: CREATE_FOOD_LOG_KEY,
      predicate: (mutation) =>
        mutation.state.status === 'pending' &&
        (mutation.state.isPaused || mutation.state.failureCount > 0),
    },
    select: (mutation) => mutation.state.variables as CreateFoodLogVariables | undefined,
  });
  return pending.filter(
    (variables): variables is CreateFoodLogVariables =>
      variables?.loggedDate === loggedDate && variables.meal === meal,
  );
}
