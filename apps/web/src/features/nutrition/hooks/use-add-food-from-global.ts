import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addFoodFromGlobal } from '../api/foods';
import { foodKeys } from './use-foods';

// Picking a catalog result makes (or reuses) your own copy first, so everything that
// logs or builds from foods keeps working with a plain foodId.
export function useAddFoodFromGlobal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ globalProductId, name }: { globalProductId: string; name: string }) =>
      addFoodFromGlobal(globalProductId, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
