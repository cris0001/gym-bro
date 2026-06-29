import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateRecipeInput } from '@gym-bro/shared';

import { createRecipe } from '../api/recipes';
import { recipeKeys } from './use-recipes';

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecipeInput) => createRecipe(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
