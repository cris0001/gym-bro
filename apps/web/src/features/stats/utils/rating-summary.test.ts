import { describe, expect, it } from 'vitest';

import type { RatingTrendPoint } from '@gym-bro/shared';

import { summarizeRatings } from './rating-summary';

const TODAY = new Date(2026, 10, 13);

function point(date: string, rating: number): RatingTrendPoint {
  return { sessionId: date, date, rating, name: `Workout ${date}`, sessionType: 'strength' };
}

describe('summarizeRatings', () => {
  it('averages every rating and counts each star level', () => {
    const summary = summarizeRatings(
      [point('2026-01-01', 5), point('2026-02-01', 4), point('2026-03-01', 3)],
      TODAY,
    );
    expect(summary.count).toBe(3);
    expect(summary.average).toBe(4);
    expect(summary.distribution).toEqual([0, 0, 1, 1, 1]);
  });

  it('compares the last 30 days with the 30 before', () => {
    const summary = summarizeRatings(
      [
        point('2026-09-20', 3),
        point('2026-10-05', 3),
        point('2026-11-01', 5),
        point('2026-11-10', 4),
      ],
      TODAY,
    );
    expect(summary.recentAverage).toBe(4.5);
    expect(summary.recentDelta).toBe(1.5);
  });

  it('gives no trend when one of the windows is empty', () => {
    const summary = summarizeRatings([point('2026-11-10', 4)], TODAY);
    expect(summary.recentAverage).toBe(4);
    expect(summary.recentDelta).toBeNull();
  });

  it('lists the latest five sessions, newest first', () => {
    const dates = [
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ];
    const summary = summarizeRatings(
      dates.map((d) => point(d, 4)),
      TODAY,
    );
    expect(summary.latest.map((p) => p.date)).toEqual([
      '2026-11-06',
      '2026-11-05',
      '2026-11-04',
      '2026-11-03',
      '2026-11-02',
    ]);
  });
});
