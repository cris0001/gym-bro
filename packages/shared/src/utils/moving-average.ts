// Moving averages for a dated value series (e.g. body weight over time). The
// window is CALENDAR-based — a "7-day average" is the mean of every point within
// the trailing 7 calendar days, not the trailing 7 data points — so it stays
// honest when logging is sparse (skipped days don't stretch the window).

export interface DatedValue {
  // A calendar day, 'YYYY-MM-DD'.
  date: string;
  value: number;
}

export interface MovingAveragePoint extends DatedValue {
  // Mean of all points within the trailing window ending at this point's date.
  average: number;
}

// Days since the Unix epoch for a 'YYYY-MM-DD' date. Date.UTC avoids any local
// timezone shift, and since the input is a pure calendar date the result is an
// exact integer day index — so day differences are just subtraction.
function toEpochDay(date: string): number {
  const parts = date.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

// For each point, the mean of all points whose date falls in the inclusive window
// [date - (days - 1), date]. Assumes `points` is sorted ascending by date with at
// most one entry per day (the body-measurements invariant). A two-pointer window
// keeps it O(n); the input is never mutated.
export function movingAverage(points: DatedValue[], days: number): MovingAveragePoint[] {
  if (!Number.isInteger(days) || days < 1) {
    throw new Error('days must be a positive integer');
  }
  const result: MovingAveragePoint[] = [];
  let start = 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i]!;
    sum += point.value;
    const windowStart = toEpochDay(point.date) - (days - 1);
    while (toEpochDay(points[start]!.date) < windowStart) {
      sum -= points[start]!.value;
      start++;
    }
    result.push({ ...point, average: sum / (i - start + 1) });
  }
  return result;
}
