import { queryOptions, useQuery } from '@tanstack/react-query';

import type { RecipeListItem } from '@gym-bro/shared';

import { listRecipes } from '../api/recipes';

// Query-key factory for recipes. Mutations invalidate recipeKeys.all to refresh
// both the list and any open detail.
export const recipeKeys = {
  all: ['nutrition', 'recipes'] as const,
  list: () => [...recipeKeys.all, 'list'] as const,
  detail: (id: string) => [...recipeKeys.all, 'detail', id] as const,
};

export function recipesQueryOptions() {
  return queryOptions<RecipeListItem[]>({
    queryKey: recipeKeys.list(),
    queryFn: listRecipes,
  });
}

export function useRecipes() {
  return useQuery(recipesQueryOptions());
}
