import { format, subDays } from 'date-fns';

import type { RatingTrendPoint } from '@gym-bro/shared';

export interface RatingSummary {
  count: number;
  average: number;
  // Average over the last 30 days, and the change vs the 30 days before — null when
  // either window has no rated workouts, so no trend is invented from nothing.
  recentAverage: number | null;
  recentDelta: number | null;
  // How many workouts got each rating, index 0 = 1 star … index 4 = 5 stars.
  distribution: [number, number, number, number, number];
  // The latest rated workouts, newest first.
  latest: RatingTrendPoint[];
}

const ISO = 'yyyy-MM-dd';
const LATEST_COUNT = 5;

function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length;
}

// A compact read of the rating history in place of a line chart: one 1–5 value per
// session is too coarse for a trend line to say much, but an average, a recent
// direction, the spread and the last few sessions do.
export function summarizeRatings(points: RatingTrendPoint[], today = new Date()): RatingSummary {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const recentFrom = format(subDays(today, 30), ISO);
  const previousFrom = format(subDays(today, 60), ISO);

  const recent = sorted.filter((p) => p.date > recentFrom).map((p) => p.rating);
  const previous = sorted
    .filter((p) => p.date > previousFrom && p.date <= recentFrom)
    .map((p) => p.rating);
  const recentAverage = mean(recent);
  const previousAverage = mean(previous);

  const distribution: RatingSummary['distribution'] = [0, 0, 0, 0, 0];
  for (const point of sorted) {
    const index = Math.min(5, Math.max(1, Math.round(point.rating))) - 1;
    distribution[index] = (distribution[index] ?? 0) + 1;
  }

  return {
    count: sorted.length,
    average: mean(sorted.map((p) => p.rating)) ?? 0,
    recentAverage,
    recentDelta:
      recentAverage !== null && previousAverage !== null ? recentAverage - previousAverage : null,
    distribution,
    latest: sorted.slice(-LATEST_COUNT).reverse(),
  };
}
