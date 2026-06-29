import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateFoodInput } from '@gym-bro/shared';

import { createFood } from '../api/foods';
import { foodKeys } from './use-foods';

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFoodInput) => createFood(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
