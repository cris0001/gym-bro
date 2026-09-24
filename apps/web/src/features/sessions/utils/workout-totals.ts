import type { WorkoutSessionDetail } from '@gym-bro/shared';

type Performance = WorkoutSessionDetail['performances'][number];

// Lifted volume (kg × reps) of one exercise; bodyweight or rep-less sets add nothing.
export function performanceVolume(performance: Performance): number {
  return performance.sets.reduce(
    (sum, set) => (set.weight !== null && set.reps !== null ? sum + set.weight * set.reps : sum),
    0,
  );
}

// Total logged sets and lifted volume across a finished workout's performances.
export function workoutTotals(detail: WorkoutSessionDetail): { sets: number; volume: number } {
  let sets = 0;
  let volume = 0;
  for (const performance of detail.performances) {
    sets += performance.sets.length;
    volume += performanceVolume(performance);
  }
  return { sets, volume };
}

export const formatVolume = (n: number): string => Math.round(n).toLocaleString('en-US');
