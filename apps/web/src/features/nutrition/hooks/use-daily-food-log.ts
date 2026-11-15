import { queryOptions, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import type { DailyFoodLog } from '@gym-bro/shared';

import { getDailyFoodLog } from '../api/food-log';

// Query-key factory for the diary. Each day caches separately; mutations
// invalidate foodLogKeys.all so the affected day refreshes.
export const foodLogKeys = {
  all: ['nutrition', 'food-log'] as const,
  day: (date: string) => [...foodLogKeys.all, date] as const,
  recentAll: ['nutrition', 'food-log', 'recent'] as const,
  recent: (meal: string) => [...foodLogKeys.recentAll, meal] as const,
};

export function dailyFoodLogQueryOptions(date: string) {
  return queryOptions<DailyFoodLog>({
    queryKey: foodLogKeys.day(date),
    queryFn: () => getDailyFoodLog(date),
  });
}

// Today's diary is the one most likely to change on another device while this one
// stays open (logging on the phone, the laptop showing the diary), so it also polls
// every minute — only while the app is on screen.
const TODAY_POLL_MS = 60_000;

export function useDailyFoodLog(date: string) {
  const isToday = date === format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    ...dailyFoodLogQueryOptions(date),
    refetchInterval: isToday ? TODAY_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
}
