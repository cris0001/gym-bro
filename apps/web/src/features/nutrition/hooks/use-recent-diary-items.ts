import { useQuery } from '@tanstack/react-query';

import type { MealType, RecentDiaryItem } from '@gym-bro/shared';

import { getRecentDiaryItems } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

// Last-used items for a meal (most recent first, all history), for the quick re-add
// row. Keyed under foodLogKeys.all, so logging or removing an entry invalidates it
// too. Only fetched when a meal is active (the add sheet is open).
export function useRecentDiaryItems(meal: MealType | null) {
  return useQuery<RecentDiaryItem[]>({
    queryKey: foodLogKeys.recent(meal ?? ''),
    queryFn: () => getRecentDiaryItems(meal!),
    enabled: meal !== null,
  });
}
