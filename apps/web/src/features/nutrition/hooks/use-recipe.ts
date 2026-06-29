import { queryOptions, useQuery } from '@tanstack/react-query';

import type { RecipeDetail } from '@gym-bro/shared';

import { getRecipe } from '../api/recipes';
import { recipeKeys } from './use-recipes';

export function recipeQueryOptions(id: string) {
  return queryOptions<RecipeDetail>({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipe(id),
  });
}

export function useRecipe(id: string) {
  return useQuery(recipeQueryOptions(id));
}
