import { describe, expect, it } from 'vitest';

import type { ExerciseProgressPoint } from '@gym-bro/shared';

import { headline, latestText, modeOf } from './exercise-progress';

function point(
  date: string,
  top: [number | null, number | null] | null,
  normal: [number | null, number | null] | null,
): ExerciseProgressPoint {
  return {
    sessionId: date,
    date,
    topWeight: top ? top[0] : null,
    topReps: top ? top[1] : null,
    normalWeight: normal ? normal[0] : null,
    normalReps: normal ? normal[1] : null,
  };
}

describe('modeOf', () => {
  it('measures in kg once any session carried load', () => {
    expect(modeOf([point('2026-01-01', null, [null, 8]), point('2026-01-08', null, [10, 6])])).toBe(
      'kg',
    );
  });

  it('measures in reps for bodyweight-only exercises', () => {
    expect(
      modeOf([point('2026-01-01', null, [null, 8]), point('2026-01-08', [null, 12], null)]),
    ).toBe('reps');
  });
});

describe('headline', () => {
  it('uses the top set when marked, else the normal set, ignoring reps', () => {
    const points = [
      point('2026-01-01', [100, 5], [90, 8]),
      point('2026-01-08', null, [95, 8]),
      point('2026-01-15', [105, 3], [90, 8]),
    ];
    const h = headline(points, points, 'kg');
    expect(h.latest).toEqual({ value: 105, reps: 3 });
    expect(h.latestIsTop).toBe(true);
    expect(h.change).toBe(5);
    expect(h.best).toEqual({ value: 105, date: '2026-01-15' });
  });

  it('counts a bodyweight set as 0 kg added in kg mode', () => {
    const points = [point('2026-01-01', null, [null, 10]), point('2026-01-08', [10, 6], null)];
    const h = headline(points, points, 'kg');
    expect(h.change).toBe(10);
    expect(latestText({ value: 0, reps: 10 }, 'kg')).toEqual({ value: 'BW', unit: ' × 10' });
  });

  it('tracks reps for bodyweight-only exercises', () => {
    const points = [point('2026-01-01', null, [null, 8]), point('2026-01-08', null, [null, 12])];
    const h = headline(points, points, 'reps');
    expect(h.change).toBe(4);
    expect(h.best).toEqual({ value: 12, date: '2026-01-08' });
  });

  it('has no change with a single session in range', () => {
    const points = [point('2026-01-01', [100, 5], null)];
    expect(headline(points, points, 'kg').change).toBeNull();
  });
});
