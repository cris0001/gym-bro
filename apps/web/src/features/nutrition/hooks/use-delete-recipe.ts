import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRecipe } from '../api/recipes';
import { recipeKeys } from './use-recipes';

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
