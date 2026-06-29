import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateRecipeInput } from '@gym-bro/shared';

import { updateRecipe } from '../api/recipes';
import { recipeKeys } from './use-recipes';

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecipeInput }) =>
      updateRecipe(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
