import { describe, expect, it } from 'vitest';

import type { NutritionTarget } from '@gym-bro/shared';

import { targetForDate } from './target-for-date';

// Minimal target on a given date; kcal doubles as an identity marker for assertions.
function target(effectiveDate: string, kcal: number): NutritionTarget {
  return {
    id: effectiveDate,
    userId: 'u1',
    effectiveDate,
    kcal,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    createdAt: `${effectiveDate}T00:00:00Z`,
    updatedAt: `${effectiveDate}T00:00:00Z`,
  };
}

// Oldest-first, as listTargets returns it.
const history = [
  target('2026-01-01', 2000),
  target('2026-06-01', 2200),
  target('2026-09-01', 1800),
];

describe('targetForDate', () => {
  it('returns the target in effect on the exact effective date', () => {
    expect(targetForDate(history, '2026-06-01')?.kcal).toBe(2200);
  });

  it('returns the most recent target on or before the day', () => {
    expect(targetForDate(history, '2026-07-15')?.kcal).toBe(2200);
    expect(targetForDate(history, '2026-09-30')?.kcal).toBe(1800);
  });

  it('returns null for days before the first target', () => {
    expect(targetForDate(history, '2025-12-31')).toBeNull();
  });

  it('returns null for empty history', () => {
    expect(targetForDate([], '2026-06-01')).toBeNull();
  });
});
