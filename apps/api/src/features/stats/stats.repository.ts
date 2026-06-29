import { and, asc, count, eq, gte, isNotNull, lte, max, sql, type SQL } from 'drizzle-orm';

import { db } from '../../db/client';
import { exercisePerformances } from '../../db/schema/exercise-performances';
import { exercises } from '../../db/schema/exercises';
import { sets } from '../../db/schema/sets';
import { workoutSessions } from '../../db/schema/workout-sessions';

// Drizzle queries for the training-stats domain — read-only aggregation over the
// Stage 6 workout/set tables, no new schema. Every query is scoped by userId.

// Inclusive performedDate window. from/to are independently optional (the Zod
// query allows one without the other); each present bound adds a condition, and
// and() drops the undefined ones.
function dateWindow(from: string | undefined, to: string | undefined): (SQL | undefined)[] {
  return [
    from ? gte(workoutSessions.performedDate, from) : undefined,
    to ? lte(workoutSessions.performedDate, to) : undefined,
  ];
}

// --- Exercise picker ---

// Distinct exercises the user has actually performed (matched on
// actualExerciseId, so a swapped-in exercise counts), id/name/category, ordered
// by name — drives the progress-chart picker so it never lists empty exercises.
export async function listExercisesWithHistory(userId: string) {
  return db
    .selectDistinct({
      id: exercises.id,
      name: exercises.name,
      category: exercises.category,
    })
    .from(exercisePerformances)
    .innerJoin(exercises, eq(exercisePerformances.actualExerciseId, exercises.id))
    .where(eq(exercisePerformances.userId, userId))
    .orderBy(asc(exercises.name));
}

// --- Per-exercise progress ---

// One row per session that included the exercise, oldest first. weight/volume
// arrive as numeric strings (or null when no set had the field) and are coerced
// to numbers at the boundary.
export interface ExerciseProgressRow {
  sessionId: string;
  performedDate: string;
  maxWeight: number | null;
  totalVolume: number | null;
  setCount: number;
}

// Aggregate the exercise's sets per session: heaviest set's weight, and total
// weight x reps volume (SQL SUM/MAX skip null weight/reps, so bodyweight sets
// drop out and a pure-bodyweight exercise yields null metrics). LEFT JOIN keeps
// a session with zero logged sets (setCount 0). Grouped per session, so multiple
// performances of the exercise in one session fold into a single point.
export async function findExerciseProgress(
  userId: string,
  exerciseId: string,
  from: string | undefined,
  to: string | undefined,
): Promise<ExerciseProgressRow[]> {
  const rows = await db
    .select({
      sessionId: workoutSessions.id,
      performedDate: workoutSessions.performedDate,
      maxWeight: max(sets.weight),
      totalVolume: sql<string | null>`sum(${sets.weight} * ${sets.reps})`,
      setCount: count(sets.id),
    })
    .from(exercisePerformances)
    .innerJoin(workoutSessions, eq(exercisePerformances.workoutSessionId, workoutSessions.id))
    .leftJoin(sets, eq(sets.exercisePerformanceId, exercisePerformances.id))
    .where(
      and(
        eq(exercisePerformances.userId, userId),
        eq(exercisePerformances.actualExerciseId, exerciseId),
        ...dateWindow(from, to),
      ),
    )
    .groupBy(workoutSessions.id, workoutSessions.performedDate)
    .orderBy(asc(workoutSessions.performedDate), asc(workoutSessions.createdAt));

  return rows.map((row) => ({
    sessionId: row.sessionId,
    performedDate: row.performedDate,
    maxWeight: row.maxWeight === null ? null : Number(row.maxWeight),
    totalVolume: row.totalVolume === null ? null : Number(row.totalVolume),
    setCount: row.setCount,
  }));
}

// --- Workout rating trend ---

export interface RatingTrendRow {
  sessionId: string;
  performedDate: string;
  rating: number;
  name: string;
  sessionType: (typeof workoutSessions.sessionType.enumValues)[number];
}

// Every rated session (strength or activity) in the window, oldest first;
// unrated sessions are excluded. rating is non-null here (the WHERE guarantees
// it), so it's a plain number.
export async function findRatingTrend(
  userId: string,
  from: string | undefined,
  to: string | undefined,
): Promise<RatingTrendRow[]> {
  const rows = await db
    .select({
      sessionId: workoutSessions.id,
      performedDate: workoutSessions.performedDate,
      rating: workoutSessions.rating,
      name: workoutSessions.name,
      sessionType: workoutSessions.sessionType,
    })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        isNotNull(workoutSessions.rating),
        ...dateWindow(from, to),
      ),
    )
    .orderBy(asc(workoutSessions.performedDate), asc(workoutSessions.createdAt));

  // rating is non-null per the WHERE, but the column type is nullable; narrow it.
  return rows.map((row) => ({
    sessionId: row.sessionId,
    performedDate: row.performedDate,
    rating: row.rating ?? 0,
    name: row.name,
    sessionType: row.sessionType,
  }));
}
