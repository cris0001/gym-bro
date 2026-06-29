import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateFoodInput } from '@gym-bro/shared';

import { updateFood } from '../api/foods';
import { foodKeys } from './use-foods';

export function useUpdateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFoodInput }) => updateFood(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
