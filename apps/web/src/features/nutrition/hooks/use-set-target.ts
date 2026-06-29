import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SetNutritionTargetInput } from '@gym-bro/shared';

import { setTarget } from '../api/targets';
import { targetKeys } from './use-targets';

export function useSetTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetNutritionTargetInput) => setTarget(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: targetKeys.all });
    },
  });
}
