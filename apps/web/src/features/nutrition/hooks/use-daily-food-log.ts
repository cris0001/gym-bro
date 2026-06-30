import { queryOptions, useQuery } from '@tanstack/react-query';

import type { DailyFoodLog } from '@gym-bro/shared';

import { getDailyFoodLog } from '../api/food-log';

// Query-key factory for the diary. Each day caches separately; mutations
// invalidate foodLogKeys.all so the affected day refreshes.
export const foodLogKeys = {
  all: ['nutrition', 'food-log'] as const,
  day: (date: string) => [...foodLogKeys.all, date] as const,
  recent: (meal: string) => [...foodLogKeys.all, 'recent', meal] as const,
};

export function dailyFoodLogQueryOptions(date: string) {
  return queryOptions<DailyFoodLog>({
    queryKey: foodLogKeys.day(date),
    queryFn: () => getDailyFoodLog(date),
  });
}

export function useDailyFoodLog(date: string) {
  return useQuery(dailyFoodLogQueryOptions(date));
}
