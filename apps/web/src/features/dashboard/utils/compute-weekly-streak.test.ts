import { describe, expect, it } from 'vitest';

import { computeWeeklyStreak, countWorkoutsThisWeek } from './compute-weekly-streak';

// 2026-06-24 is a Wednesday; its Monday-based week starts 2026-06-22. Prior weeks
// start 06-15, 06-08, 06-01.
const TODAY = new Date('2026-06-24T12:00:00');

describe('computeWeeklyStreak', () => {
  it('returns 0 with no workouts', () => {
    expect(computeWeeklyStreak([], TODAY)).toBe(0);
  });

  it('counts consecutive weeks with >=2 workouts, stopping at a short week', () => {
    const dates = ['2026-06-22', '2026-06-24', '2026-06-15', '2026-06-17', '2026-06-08'];
    // current week (2) + prior week (2) qualify; the 06-08 week has only 1 → stop.
    expect(computeWeeklyStreak(dates, TODAY)).toBe(2);
  });

  it('gives the in-progress week grace: a short current week does not break the streak', () => {
    const dates = [
      '2026-06-24',
      '2026-06-15',
      '2026-06-17',
      '2026-06-08',
      '2026-06-10',
      '2026-06-01',
    ];
    // current week has only 1 → skipped; 06-15 (2) + 06-08 (2) qualify; 06-01 has 1 → stop.
    expect(computeWeeklyStreak(dates, TODAY)).toBe(2);
  });

  it('does not count a week with only one workout', () => {
    expect(computeWeeklyStreak(['2026-06-22'], TODAY)).toBe(0);
  });
});

describe('countWorkoutsThisWeek', () => {
  it('counts only workouts in the current week', () => {
    const dates = ['2026-06-22', '2026-06-24', '2026-06-15'];
    expect(countWorkoutsThisWeek(dates, TODAY)).toBe(2);
  });
});
