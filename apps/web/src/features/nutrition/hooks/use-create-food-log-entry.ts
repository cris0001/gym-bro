import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { createFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

export function useCreateFoodLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFoodLogInput) => createFoodLogEntry(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodLogKeys.all });
    },
  });
}
