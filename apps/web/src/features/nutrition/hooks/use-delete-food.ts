import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFood } from '../api/foods';
import { foodKeys } from './use-foods';
import { recipeKeys } from './use-recipes';

export function useDeleteFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFood(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
      void queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
