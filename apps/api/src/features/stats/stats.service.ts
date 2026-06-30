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

// Per-session progress for one exercise over the optional date window. The
// repository returns the exercise's sets in execution order; each session is
// reduced to its representative top set (the first marked top set) and normal set
// (the first non-top set — back-offs are uniform). "First" is tracked with flags,
// not null-checks, since a bodyweight top set legitimately has a null weight.
export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  range: StatsRangeQueryInput,
): Promise<ExerciseProgressPoint[]> {
  const rows = await statsRepository.findExerciseSetRows(userId, exerciseId, range.from, range.to);

  const acc = new Map<
    string,
    { point: ExerciseProgressPoint; hasTop: boolean; hasNormal: boolean }
  >();
  for (const row of rows) {
    let entry = acc.get(row.sessionId);
    if (!entry) {
      entry = {
        point: {
          sessionId: row.sessionId,
          date: row.performedDate,
          topWeight: null,
          topReps: null,
          normalWeight: null,
          normalReps: null,
        },
        hasTop: false,
        hasNormal: false,
      };
      acc.set(row.sessionId, entry);
    }
    if (row.isTopSet && !entry.hasTop) {
      entry.point.topWeight = row.weight;
      entry.point.topReps = row.reps;
      entry.hasTop = true;
    } else if (!row.isTopSet && !entry.hasNormal) {
      entry.point.normalWeight = row.weight;
      entry.point.normalReps = row.reps;
      entry.hasNormal = true;
    }
  }
  // Map preserves insertion order = oldest session first (rows are date-ordered).
  return [...acc.values()].map((entry) => entry.point);
}

// Rating trend across all rated sessions in the optional date window.
export async function getRatingTrend(
  userId: string,
  range: StatsRangeQueryInput,
): Promise<RatingTrendPoint[]> {
  const rows = await statsRepository.findRatingTrend(userId, range.from, range.to);
  return rows.map(({ performedDate, ...rest }) => ({ ...rest, date: performedDate }));
}
