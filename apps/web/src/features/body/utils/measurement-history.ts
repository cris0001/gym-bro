import { format, parseISO } from 'date-fns';

import type { BodyMeasurement } from '@gym-bro/shared';

export const CIRCUMFERENCES = ['bicepsCm', 'chestCm', 'waistCm', 'hipCm', 'thighCm'] as const;

export interface HistoryRow {
  entry: BodyMeasurement;
  // Weight change vs the next older entry that has a weight; null when either is missing.
  delta: number | null;
}

// Newest-first entries → newest-first month buckets of rows, each row carrying its
// weight delta. The delta looks across month boundaries, so the first row of a
// month still compares against the previous month's last weigh-in.
export function historyGroups(entries: BodyMeasurement[]) {
  const groups = new Map<string, HistoryRow[]>();
  entries.forEach((entry, i) => {
    const older = entries.slice(i + 1).find((e) => e.weightKg !== null);
    const delta =
      entry.weightKg !== null && older?.weightKg != null
        ? Math.round((entry.weightKg - older.weightKg) * 10) / 10
        : null;
    const key = entry.measuredDate.slice(0, 7);
    const list = groups.get(key);
    if (list) list.push({ entry, delta });
    else groups.set(key, [{ entry, delta }]);
  });
  return [...groups.entries()].map(([key, rows]) => ({
    key,
    label: format(parseISO(`${key}-01`), 'LLLL yyyy'),
    rows,
  }));
}
