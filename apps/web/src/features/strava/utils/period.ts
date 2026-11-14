import { format, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns';

import type { StravaSessionItem } from '@gym-bro/shared';

export type Period = 'month' | 'year' | 'all';

export const PERIODS: { key: Period; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All' },
];

// The selected period ('YYYY-MM-DD' bounds, inclusive) and the comparison window: the
// same elapsed span of the previous month/year (Nov 1–14 vs Oct 1–14), so a part-way
// period isn't compared against a full one. 'all' has no window and no comparison.
export interface PeriodWindow {
  from: string | null;
  previous: { from: string; to: string; label: string } | null;
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

export function periodWindow(period: Period, now = new Date()): PeriodWindow {
  if (period === 'month') {
    const prev = subMonths(now, 1);
    return {
      from: iso(startOfMonth(now)),
      previous: { from: iso(startOfMonth(prev)), to: iso(prev), label: format(prev, 'MMM') },
    };
  }
  if (period === 'year') {
    const prev = subYears(now, 1);
    return {
      from: iso(startOfYear(now)),
      previous: { from: iso(startOfYear(prev)), to: iso(prev), label: format(prev, 'yyyy') },
    };
  }
  return { from: null, previous: null };
}

// Sessions whose local date falls in [from, to] (either bound optional). Dates are
// 'YYYY-MM-DD' strings, so the comparison is lexical.
export function inRange(
  sessions: StravaSessionItem[],
  from: string | null,
  to: string | null = null,
): StravaSessionItem[] {
  return sessions.filter(
    (s) => (from === null || s.localDate >= from) && (to === null || s.localDate <= to),
  );
}
