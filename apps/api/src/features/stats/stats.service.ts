import type {
  ExerciseProgressPoint,
  RatingTrendPoint,
  StatExercise,
  StatsRangeQueryInput,
} from '@gym-bro/shared';

import * as statsRepository from './stats.repository';

// Business logic for the training-stats domain — maps repository rows to the
// shared wire shapes (performedDate -> date). No Drizzle here. The from <= to
// window order is already enforced by the Zod query schema.

// Exercises the user has logged, for the progress-chart picker.
export async function listExercisesWithHistory(userId: string): Promise<StatExercise[]> {
  return statsRepository.listExercisesWithHistory(userId);
}

// Per-session progress for one exercise over the optional date window.
export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  range: StatsRangeQueryInput,
): Promise<ExerciseProgressPoint[]> {
  const rows = await statsRepository.findExerciseProgress(userId, exerciseId, range.from, range.to);
  return rows.map(({ performedDate, ...rest }) => ({ ...rest, date: performedDate }));
}

// Rating trend across all rated sessions in the optional date window.
export async function getRatingTrend(
  userId: string,
  range: StatsRangeQueryInput,
): Promise<RatingTrendPoint[]> {
  const rows = await statsRepository.findRatingTrend(userId, range.from, range.to);
  return rows.map(({ performedDate, ...rest }) => ({ ...rest, date: performedDate }));
}
