import { describe, expect, it } from 'vitest';

import { movingAverage, type DatedValue } from './moving-average';

// Build an ascending series; `start` day + offsets keeps the dates readable.
function series(entries: [date: string, value: number][]): DatedValue[] {
  return entries.map(([date, value]) => ({ date, value }));
}

// Just the averages, for concise assertions.
function averages(points: DatedValue[], days: number): number[] {
  return movingAverage(points, days).map((p) => p.average);
}

describe('movingAverage', () => {
  it('returns an empty array for no points', () => {
    expect(movingAverage([], 7)).toEqual([]);
  });

  it('averages a single point to its own value', () => {
    expect(movingAverage(series([['2026-06-01', 80]]), 7)).toEqual([
      { date: '2026-06-01', value: 80, average: 80 },
    ]);
  });

  it('with a 1-day window returns each raw value (no smoothing)', () => {
    const points = series([
      ['2026-06-01', 80],
      ['2026-06-02', 82],
      ['2026-06-03', 81],
    ]);
    expect(averages(points, 1)).toEqual([80, 82, 81]);
  });

  it('averages over the trailing window for a dense daily series', () => {
    const points = series([
      ['2026-06-01', 80],
      ['2026-06-02', 82],
      ['2026-06-03', 84],
      ['2026-06-04', 86],
    ]);
    // 3-day window: [80], [80,82], [80,82,84], [82,84,86] (06-01 drops out at i=3).
    expect(averages(points, 3)).toEqual([80, 81, 82, 84]);
  });

  it('uses a CALENDAR window, so gaps drop old points (not the last N points)', () => {
    const points = series([
      ['2026-06-01', 80],
      ['2026-06-05', 84],
      ['2026-06-10', 90],
    ]);
    // 7-day window. At 06-10 the window is [06-04, 06-10]: 06-05 stays, 06-01
    // (9 days back) drops — a trailing-3-points average would have kept it.
    expect(averages(points, 7)).toEqual([80, 82, 87]);
  });

  it('treats the window as inclusive on the lower bound', () => {
    // days = 7 → diffs 0..6 are in-window; a 7-day-old point is out.
    expect(
      averages(
        series([
          ['2026-06-01', 80],
          ['2026-06-07', 90],
        ]),
        7,
      ),
    ).toEqual([80, 85]);
    expect(
      averages(
        series([
          ['2026-06-01', 80],
          ['2026-06-08', 90],
        ]),
        7,
      ),
    ).toEqual([80, 90]);
  });

  it('with a wide window is the cumulative mean while points stay inside it', () => {
    const points = series([
      ['2026-06-01', 10],
      ['2026-06-15', 20],
      ['2026-06-20', 30],
    ]);
    expect(averages(points, 30)).toEqual([10, 15, 20]);
  });

  it('does not mutate the input', () => {
    const points = series([
      ['2026-06-01', 80],
      ['2026-06-02', 82],
    ]);
    const snapshot = structuredClone(points);
    movingAverage(points, 7);
    expect(points).toEqual(snapshot);
  });

  it('rejects a non-positive or non-integer window', () => {
    expect(() => movingAverage([], 0)).toThrow();
    expect(() => movingAverage([], -1)).toThrow();
    expect(() => movingAverage([], 1.5)).toThrow();
  });
});
