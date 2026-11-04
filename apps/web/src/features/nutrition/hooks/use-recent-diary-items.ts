import { useQuery } from '@tanstack/react-query';

import type { MealType, RecentDiaryItem } from '@gym-bro/shared';

import { getRecentDiaryItems } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

// Last-used items for a meal (most recent first, all history), for the quick re-add
// row. Only fetched when a meal is active (the add view is open).
//
// staleTime Infinity: reopening a meal reuses the cached list with NO request. It's
// refreshed only when something changed it — logging marks it invalidated (without
// refetching mid-session, see useCreateFoodLogEntry) and the add view refetches
// invalidated lists in the background on Done, so the next open is current.
export function useRecentDiaryItems(meal: MealType | null) {
  return useQuery<RecentDiaryItem[]>({
    queryKey: foodLogKeys.recent(meal ?? ''),
    queryFn: () => getRecentDiaryItems(meal!),
    enabled: meal !== null,
    staleTime: Infinity,
  });
}
