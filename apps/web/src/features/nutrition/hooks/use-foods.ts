import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Food } from '@gym-bro/shared';

import { listFoods } from '../api/foods';

// Query-key factory for the food dictionary. Each search term caches separately;
// mutations invalidate foodKeys.all to refresh every list.
export const foodKeys = {
  all: ['nutrition', 'foods'] as const,
  list: (search: string) => [...foodKeys.all, search] as const,
};

export function foodsQueryOptions(search: string) {
  return queryOptions<Food[]>({
    queryKey: foodKeys.list(search),
    queryFn: () => listFoods(search || undefined),
  });
}

export function useFoods(search: string) {
  return useQuery(foodsQueryOptions(search));
}
