import type { NutritionTarget } from '@gym-bro/shared';

import { targetForDate } from '../utils/target-for-date';
import { useTargets } from './use-targets';

// The nutrition target that applied on `date`, derived from the cached target history
// (see targetForDate). Use this instead of useCurrentTarget wherever a specific day is
// shown, so past days compare against the goal that was current then.
export function useTargetForDate(date: string): NutritionTarget | null {
  const { data: history = [] } = useTargets();
  return targetForDate(history, date);
}
