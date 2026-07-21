import { format, parseISO, startOfWeek, subWeeks } from 'date-fns';

import type { StravaSessionItem } from '@gym-bro/shared';

// Totals across a set of activities, for the dashboard summary tiles. Missing metrics
// count as zero.
export interface ActivitySummary {
  count: number;
  distanceM: number;
  movingTimeS: number;
  elevationM: number;
}

export function summarize(sessions: StravaSessionItem[]): ActivitySummary {
  return sessions.reduce<ActivitySummary>(
    (acc, s) => ({
      count: acc.count + 1,
      distanceM: acc.distanceM + (s.distanceM ?? 0),
      movingTimeS: acc.movingTimeS + (s.movingTimeS ?? 0),
      elevationM: acc.elevationM + (s.elevationGainM ?? 0),
    }),
    { count: 0, distanceM: 0, movingTimeS: 0, elevationM: 0 },
  );
}

// Per-week totals of some metric for the trailing `weeks` weeks (oldest → newest),
// for the volume bar chart. `valueOf` picks the metric (distance for distance sports,
// moving time otherwise). Weeks start Monday.
export interface WeekBucket {
  weekStart: string;
  label: string;
  value: number;
}

export function weeklyVolume(
  sessions: StravaSessionItem[],
  valueOf: (s: StravaSessionItem) => number,
  weeks = 12,
): WeekBucket[] {
  const keyOf = (d: Date) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const now = new Date();

  const buckets: WeekBucket[] = [];
  const index = new Map<string, number>();
  for (let i = weeks - 1; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const key = format(start, 'yyyy-MM-dd');
    index.set(key, buckets.length);
    buckets.push({ weekStart: key, label: format(start, 'MMM d'), value: 0 });
  }

  for (const session of sessions) {
    const idx = index.get(keyOf(parseISO(session.localDate)));
    if (idx !== undefined) buckets[idx]!.value += valueOf(session);
  }
  return buckets;
}
