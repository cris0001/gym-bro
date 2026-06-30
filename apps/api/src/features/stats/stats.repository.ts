import { and, asc, eq, gte, isNotNull, lte, type SQL } from 'drizzle-orm';

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

// One row per logged set of the exercise (matched on actualExerciseId, so swaps
// count), in execution order: oldest session first, then performance order, then
// set order. weight arrives as a numeric string (or null = bodyweight) and is
// coerced here. The service reduces these into per-session top/normal points.
export interface ExerciseSetRow {
  sessionId: string;
  performedDate: string;
  weight: number | null;
  reps: number | null;
  isTopSet: boolean;
}

export async function findExerciseSetRows(
  userId: string,
  exerciseId: string,
  from: string | undefined,
  to: string | undefined,
): Promise<ExerciseSetRow[]> {
  const rows = await db
    .select({
      sessionId: workoutSessions.id,
      performedDate: workoutSessions.performedDate,
      weight: sets.weight,
      reps: sets.reps,
      isTopSet: sets.isTopSet,
    })
    .from(exercisePerformances)
    .innerJoin(workoutSessions, eq(exercisePerformances.workoutSessionId, workoutSessions.id))
    .innerJoin(sets, eq(sets.exercisePerformanceId, exercisePerformances.id))
    .where(
      and(
        eq(exercisePerformances.userId, userId),
        eq(exercisePerformances.actualExerciseId, exerciseId),
        ...dateWindow(from, to),
      ),
    )
    .orderBy(
      asc(workoutSessions.performedDate),
      asc(workoutSessions.createdAt),
      asc(exercisePerformances.position),
      asc(sets.position),
    );

  return rows.map((row) => ({
    sessionId: row.sessionId,
    performedDate: row.performedDate,
    weight: row.weight === null ? null : Number(row.weight),
    reps: row.reps,
    isTopSet: row.isTopSet,
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
