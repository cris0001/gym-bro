import type { NutritionTarget } from '@gym-bro/shared';

// The target in effect on a given day: the most recent entry whose effectiveDate is on
// or before that day. Returns null for days before the first target was ever set. This
// keeps the diary honest under history — a past day is judged against the goal that was
// current back then, not whatever the latest target happens to be now.
// Assumes `history` is sorted oldest-first (as listTargets returns it). Dates are
// 'yyyy-MM-dd' strings, so lexical comparison matches chronological order.
export function targetForDate(history: NutritionTarget[], date: string): NutritionTarget | null {
  let match: NutritionTarget | null = null;
  for (const target of history) {
    if (target.effectiveDate <= date) match = target;
    else break;
  }
  return match;
}
