import { format, parseISO, startOfWeek, subWeeks } from 'date-fns';

// A week counts toward the streak only with at least this many workouts.
export const MIN_WORKOUTS_PER_WEEK = 2;

const ISO = 'yyyy-MM-dd';
const WEEK_OPTS = { weekStartsOn: 1 } as const;

function weekKey(date: Date): string {
  return format(startOfWeek(date, WEEK_OPTS), ISO);
}

// Consecutive weeks (Monday-based) each with ≥ MIN_WORKOUTS_PER_WEEK workouts,
// counting back from the current week. The in-progress current week is given
// grace: if it doesn't qualify yet it doesn't break the streak — counting starts
// from the previous week instead. performedDates are 'YYYY-MM-DD' strings.
export function computeWeeklyStreak(performedDates: string[], today: Date): number {
  const counts = new Map<string, number>();
  for (const date of performedDates) {
    const key = weekKey(parseISO(date));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const qualifies = (key: string): boolean => (counts.get(key) ?? 0) >= MIN_WORKOUTS_PER_WEEK;

  let cursor = startOfWeek(today, WEEK_OPTS);
  if (!qualifies(format(cursor, ISO))) {
    cursor = subWeeks(cursor, 1);
  }

  let streak = 0;
  while (qualifies(format(cursor, ISO))) {
    streak += 1;
    cursor = subWeeks(cursor, 1);
  }
  return streak;
}

// How many workouts fall in the week containing `today` — for the "N / goal this
// week" progress line.
export function countWorkoutsThisWeek(performedDates: string[], today: Date): number {
  const current = weekKey(today);
  return performedDates.filter((date) => weekKey(parseISO(date)) === current).length;
}
