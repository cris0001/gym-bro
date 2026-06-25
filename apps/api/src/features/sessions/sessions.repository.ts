import { and, between, count, desc, eq, inArray, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { db } from '../../db/client';
import { exercisePerformances } from '../../db/schema/exercise-performances';
import { exercises } from '../../db/schema/exercises';
import { plannedSessions, type PlannedSession } from '../../db/schema/planned-sessions';
import { sets } from '../../db/schema/sets';
import { workoutSessionTags } from '../../db/schema/workout-session-tags';
import { workoutSessions, type WorkoutSession } from '../../db/schema/workout-sessions';
import { workoutTags } from '../../db/schema/workout-tags';
import { workoutTemplates } from '../../db/schema/workout-templates';

// Drizzle queries for the sessions domain — plain rows, no business logic. Every
// query is scoped by userId. Grown per resource (planned sessions first).

// Editable via PATCH; both optional to line up with the Zod-inferred input under
// exactOptionalPropertyTypes. status covers the user-settable values plus the
// system-set 'completed' (written when a workout is finished).
interface PlannedSessionUpdate {
  status?: PlannedSession['status'] | undefined;
  scheduledDate?: string | undefined;
}

// A planned session with its template's name, for the calendar (avoids a second
// lookup per entry). scheduledDate is a 'YYYY-MM-DD' string.
export interface PlannedSessionWithTemplateRow extends PlannedSession {
  templateName: string;
  // The workout that fulfilled this entry (null unless completed), so the calendar
  // can link to it in history.
  workoutSessionId: string | null;
}

// --- Planned sessions ---

// Calendar entries in an inclusive date window, oldest first. INNER JOIN because
// a planned session always has a template (the FK cascades on template delete).
export async function listPlannedSessionsByRange(
  userId: string,
  from: string,
  to: string,
): Promise<PlannedSessionWithTemplateRow[]> {
  return db
    .select({
      id: plannedSessions.id,
      userId: plannedSessions.userId,
      workoutTemplateId: plannedSessions.workoutTemplateId,
      scheduledDate: plannedSessions.scheduledDate,
      status: plannedSessions.status,
      createdAt: plannedSessions.createdAt,
      updatedAt: plannedSessions.updatedAt,
      templateName: workoutTemplates.name,
      workoutSessionId: workoutSessions.id,
    })
    .from(plannedSessions)
    .innerJoin(workoutTemplates, eq(plannedSessions.workoutTemplateId, workoutTemplates.id))
    .leftJoin(
      workoutSessions,
      and(
        eq(workoutSessions.plannedSessionId, plannedSessions.id),
        eq(workoutSessions.userId, userId),
      ),
    )
    .where(
      and(eq(plannedSessions.userId, userId), between(plannedSessions.scheduledDate, from, to)),
    )
    .orderBy(plannedSessions.scheduledDate);
}

export async function findPlannedSessionById(
  userId: string,
  id: string,
): Promise<PlannedSession | undefined> {
  const [row] = await db
    .select()
    .from(plannedSessions)
    .where(and(eq(plannedSessions.id, id), eq(plannedSessions.userId, userId)))
    .limit(1);
  return row;
}

export async function createPlannedSession(data: {
  userId: string;
  workoutTemplateId: string;
  scheduledDate: string;
}): Promise<PlannedSession> {
  const [row] = await db.insert(plannedSessions).values(data).returning();
  if (!row) {
    throw new Error('Planned session insert returned no row');
  }
  return row;
}

export async function updatePlannedSession(
  userId: string,
  id: string,
  data: PlannedSessionUpdate,
): Promise<PlannedSession | undefined> {
  const [row] = await db
    .update(plannedSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(plannedSessions.id, id), eq(plannedSessions.userId, userId)))
    .returning();
  return row;
}

// Hard delete — a calendar entry carries no history (finished workouts live in
// workout_sessions, which only SET NULL their planned_session_id).
export async function deletePlannedSession(
  userId: string,
  id: string,
): Promise<PlannedSession | undefined> {
  const [row] = await db
    .delete(plannedSessions)
    .where(and(eq(plannedSessions.id, id), eq(plannedSessions.userId, userId)))
    .returning();
  return row;
}

// --- Workout sessions (writes) ---

// Caller passes already-validated, already-ordered data; weight arrives as a
// number and is stringified for the numeric column here at the boundary.
interface SetInput {
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

interface PerformanceInput {
  originalExerciseId: string;
  actualExerciseId: string;
  notes: string | null;
  sets: SetInput[];
}

interface CreateStrengthSessionData {
  userId: string;
  plannedSessionId: string | null;
  workoutTemplateId: string | null;
  name: string;
  performedDate: string;
  durationMinutes: number | null;
  rating: number | null;
  notes: string | null;
  performances: PerformanceInput[];
  tagIds: string[];
}

interface CreateActivitySessionData {
  userId: string;
  name: string;
  performedDate: string;
  durationMinutes: number | null;
  rating: number | null;
  notes: string | null;
  tagIds: string[];
}

// The atomic "finish workout" write: session → performances → sets → tag links,
// plus marking a fulfilled planned session completed — all in one transaction so
// a partial workout never lands. Performance/set order comes from array index.
export async function createStrengthSession(
  data: CreateStrengthSessionData,
): Promise<WorkoutSession> {
  return db.transaction(async (tx) => {
    // A manual session that names a template but isn't tied to a planned entry
    // back-fills the calendar: ensure a planned row exists for this day+template
    // and mark it completed, then link the workout to it. ON CONFLICT handles a
    // pre-existing entry for that day+template (planned/skipped → completed).
    let plannedSessionId = data.plannedSessionId;
    if (plannedSessionId === null && data.workoutTemplateId !== null) {
      const [planned] = await tx
        .insert(plannedSessions)
        .values({
          userId: data.userId,
          scheduledDate: data.performedDate,
          workoutTemplateId: data.workoutTemplateId,
          status: 'completed',
        })
        .onConflictDoUpdate({
          target: [
            plannedSessions.userId,
            plannedSessions.scheduledDate,
            plannedSessions.workoutTemplateId,
          ],
          set: { status: 'completed', updatedAt: new Date() },
        })
        .returning();
      if (!planned) {
        throw new Error('Planned session upsert returned no row');
      }
      plannedSessionId = planned.id;
    }

    const [session] = await tx
      .insert(workoutSessions)
      .values({
        userId: data.userId,
        plannedSessionId,
        workoutTemplateId: data.workoutTemplateId,
        sessionType: 'strength',
        name: data.name,
        performedDate: data.performedDate,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        notes: data.notes,
      })
      .returning();
    if (!session) {
      throw new Error('Workout session insert returned no row');
    }

    for (const [position, performance] of data.performances.entries()) {
      const [perfRow] = await tx
        .insert(exercisePerformances)
        .values({
          workoutSessionId: session.id,
          userId: data.userId,
          originalExerciseId: performance.originalExerciseId,
          actualExerciseId: performance.actualExerciseId,
          notes: performance.notes,
          position,
        })
        .returning();
      if (!perfRow) {
        throw new Error('Exercise performance insert returned no row');
      }
      if (performance.sets.length > 0) {
        await tx.insert(sets).values(
          performance.sets.map((set, setPosition) => ({
            exercisePerformanceId: perfRow.id,
            userId: data.userId,
            position: setPosition,
            weight: set.weight === null ? null : set.weight.toString(),
            reps: set.reps,
            rir: set.rir,
          })),
        );
      }
    }

    if (data.tagIds.length > 0) {
      await tx.insert(workoutSessionTags).values(
        data.tagIds.map((workoutTagId) => ({
          workoutSessionId: session.id,
          workoutTagId,
          userId: data.userId,
        })),
      );
    }

    if (data.plannedSessionId) {
      await tx
        .update(plannedSessions)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(
          and(
            eq(plannedSessions.id, data.plannedSessionId),
            eq(plannedSessions.userId, data.userId),
          ),
        );
    }

    return session;
  });
}

// Ad-hoc activity log: session + tag links in one transaction (no exercises).
export async function createActivitySession(
  data: CreateActivitySessionData,
): Promise<WorkoutSession> {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .insert(workoutSessions)
      .values({
        userId: data.userId,
        plannedSessionId: null,
        workoutTemplateId: null,
        sessionType: 'activity',
        name: data.name,
        performedDate: data.performedDate,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        notes: data.notes,
      })
      .returning();
    if (!session) {
      throw new Error('Workout session insert returned no row');
    }

    if (data.tagIds.length > 0) {
      await tx.insert(workoutSessionTags).values(
        data.tagIds.map((workoutTagId) => ({
          workoutSessionId: session.id,
          workoutTagId,
          userId: data.userId,
        })),
      );
    }

    return session;
  });
}

// --- Workout sessions (reads, update, delete) ---

// Two aliased joins to `exercises` so a performance resolves both the actual and
// the originally-prescribed exercise identity in one query.
const actualExercise = alias(exercises, 'actual_exercise');
const originalExercise = alias(exercises, 'original_exercise');

// Editable metadata; all optional to line up with the Zod-inferred input under
// exactOptionalPropertyTypes. Tag replacement is handled separately.
interface WorkoutSessionMetaUpdate {
  name?: string | undefined;
  rating?: number | null | undefined;
  notes?: string | null | undefined;
  durationMinutes?: number | null | undefined;
}

export async function findWorkoutSessionById(
  userId: string,
  id: string,
): Promise<WorkoutSession | undefined> {
  const [row] = await db
    .select()
    .from(workoutSessions)
    .where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)))
    .limit(1);
  return row;
}

// One page of history, newest first (createdAt breaks ties within a day).
export async function listWorkoutSessionsPage(
  userId: string,
  limit: number,
  offset: number,
  from?: string,
  to?: string,
): Promise<WorkoutSession[]> {
  return db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        from && to ? between(workoutSessions.performedDate, from, to) : undefined,
      ),
    )
    .orderBy(desc(workoutSessions.performedDate), desc(workoutSessions.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countWorkoutSessions(
  userId: string,
  from?: string,
  to?: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        from && to ? between(workoutSessions.performedDate, from, to) : undefined,
      ),
    );
  return row?.value ?? 0;
}

// Tag links for a set of sessions, joined to the tag identity — attaches tags to
// history items and the detail view without an N+1.
export async function listTagsForSessions(userId: string, sessionIds: string[]) {
  if (sessionIds.length === 0) {
    return [];
  }
  return db
    .select({
      workoutSessionId: workoutSessionTags.workoutSessionId,
      id: workoutTags.id,
      name: workoutTags.name,
      color: workoutTags.color,
      isActive: workoutTags.isActive,
    })
    .from(workoutSessionTags)
    .innerJoin(workoutTags, eq(workoutSessionTags.workoutTagId, workoutTags.id))
    .where(
      and(
        inArray(workoutSessionTags.workoutSessionId, sessionIds),
        eq(workoutSessionTags.userId, userId),
      ),
    );
}

// A session's performances, ordered, each with its actual + original exercise
// identity (isActive surfaces a soft-deleted-but-referenced exercise).
export async function listPerformancesForSession(userId: string, sessionId: string) {
  return db
    .select({
      id: exercisePerformances.id,
      workoutSessionId: exercisePerformances.workoutSessionId,
      userId: exercisePerformances.userId,
      originalExerciseId: exercisePerformances.originalExerciseId,
      actualExerciseId: exercisePerformances.actualExerciseId,
      position: exercisePerformances.position,
      notes: exercisePerformances.notes,
      createdAt: exercisePerformances.createdAt,
      updatedAt: exercisePerformances.updatedAt,
      actual: {
        id: actualExercise.id,
        name: actualExercise.name,
        category: actualExercise.category,
        isActive: actualExercise.isActive,
      },
      original: {
        id: originalExercise.id,
        name: originalExercise.name,
        category: originalExercise.category,
        isActive: originalExercise.isActive,
      },
    })
    .from(exercisePerformances)
    .innerJoin(actualExercise, eq(exercisePerformances.actualExerciseId, actualExercise.id))
    .innerJoin(originalExercise, eq(exercisePerformances.originalExerciseId, originalExercise.id))
    .where(
      and(
        eq(exercisePerformances.workoutSessionId, sessionId),
        eq(exercisePerformances.userId, userId),
      ),
    )
    .orderBy(exercisePerformances.position);
}

// A session's sets across all its performances, ordered, with weight coerced
// from the numeric column's string back to a number for the API contract.
export async function listSetsForSession(userId: string, sessionId: string) {
  const rows = await db
    .select({
      id: sets.id,
      exercisePerformanceId: sets.exercisePerformanceId,
      userId: sets.userId,
      position: sets.position,
      weight: sets.weight,
      reps: sets.reps,
      rir: sets.rir,
      createdAt: sets.createdAt,
      updatedAt: sets.updatedAt,
    })
    .from(sets)
    .innerJoin(exercisePerformances, eq(sets.exercisePerformanceId, exercisePerformances.id))
    .where(and(eq(exercisePerformances.workoutSessionId, sessionId), eq(sets.userId, userId)))
    .orderBy(sets.position);
  return rows.map((row) => ({ ...row, weight: row.weight === null ? null : Number(row.weight) }));
}

// One past performance of an exercise plus its sets (weight coerced to number).
export interface ExerciseHistoryEntryRow {
  sessionId: string;
  sessionName: string;
  performedDate: string;
  sets: { weight: number | null; reps: number | null; rir: number | null }[];
}

// The most recent performances of an exercise (matched on actualExerciseId, so
// it follows swaps), newest session first, optionally only before a date. Each
// matching performance becomes one entry; sets are fetched in a second query and
// grouped, avoiding an N+1 per session.
export async function findExerciseHistory(
  userId: string,
  exerciseId: string,
  before: string | undefined,
  limit: number,
): Promise<ExerciseHistoryEntryRow[]> {
  const performances = await db
    .select({
      performanceId: exercisePerformances.id,
      sessionId: workoutSessions.id,
      sessionName: workoutSessions.name,
      performedDate: workoutSessions.performedDate,
    })
    .from(exercisePerformances)
    .innerJoin(workoutSessions, eq(exercisePerformances.workoutSessionId, workoutSessions.id))
    .where(
      and(
        eq(exercisePerformances.userId, userId),
        eq(exercisePerformances.actualExerciseId, exerciseId),
        before ? lt(workoutSessions.performedDate, before) : undefined,
      ),
    )
    .orderBy(desc(workoutSessions.performedDate), desc(workoutSessions.createdAt))
    .limit(limit);

  if (performances.length === 0) {
    return [];
  }

  const performanceIds = performances.map((row) => row.performanceId);
  const setRows = await db
    .select({
      exercisePerformanceId: sets.exercisePerformanceId,
      weight: sets.weight,
      reps: sets.reps,
      rir: sets.rir,
    })
    .from(sets)
    .where(and(inArray(sets.exercisePerformanceId, performanceIds), eq(sets.userId, userId)))
    .orderBy(sets.position);

  const setsByPerformance = new Map<string, ExerciseHistoryEntryRow['sets']>();
  for (const row of setRows) {
    const list = setsByPerformance.get(row.exercisePerformanceId) ?? [];
    list.push({
      weight: row.weight === null ? null : Number(row.weight),
      reps: row.reps,
      rir: row.rir,
    });
    setsByPerformance.set(row.exercisePerformanceId, list);
  }

  return performances.map((row) => ({
    sessionId: row.sessionId,
    sessionName: row.sessionName,
    performedDate: row.performedDate,
    sets: setsByPerformance.get(row.performanceId) ?? [],
  }));
}

// Update metadata; when tagIds is provided, replace the whole tag set. One
// transaction so the metadata change and tag replacement commit together.
export async function updateWorkoutSession(
  userId: string,
  id: string,
  meta: WorkoutSessionMetaUpdate,
  tagIds: string[] | undefined,
): Promise<WorkoutSession | undefined> {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .update(workoutSessions)
      .set({ ...meta, updatedAt: new Date() })
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)))
      .returning();
    if (!session) {
      return undefined;
    }
    if (tagIds !== undefined) {
      await tx.delete(workoutSessionTags).where(eq(workoutSessionTags.workoutSessionId, id));
      if (tagIds.length > 0) {
        await tx
          .insert(workoutSessionTags)
          .values(tagIds.map((workoutTagId) => ({ workoutSessionId: id, workoutTagId, userId })));
      }
    }
    return session;
  });
}

interface ReplaceStrengthSessionData {
  userId: string;
  id: string;
  name: string;
  performedDate: string;
  durationMinutes: number | null;
  rating: number | null;
  notes: string | null;
  performances: PerformanceInput[];
  tagIds: string[];
}

// Edit a finished strength workout: update metadata and fully replace its
// performances/sets/tags in one transaction. The template/planned links are left
// untouched. Returns undefined if the session isn't the user's.
export async function replaceStrengthSession(
  data: ReplaceStrengthSessionData,
): Promise<WorkoutSession | undefined> {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .update(workoutSessions)
      .set({
        name: data.name,
        performedDate: data.performedDate,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(workoutSessions.id, data.id), eq(workoutSessions.userId, data.userId)))
      .returning();
    if (!session) {
      return undefined;
    }

    // Dropping the performances cascade-deletes their sets; then re-insert.
    await tx.delete(exercisePerformances).where(eq(exercisePerformances.workoutSessionId, data.id));
    for (const [position, performance] of data.performances.entries()) {
      const [perfRow] = await tx
        .insert(exercisePerformances)
        .values({
          workoutSessionId: data.id,
          userId: data.userId,
          originalExerciseId: performance.originalExerciseId,
          actualExerciseId: performance.actualExerciseId,
          notes: performance.notes,
          position,
        })
        .returning();
      if (!perfRow) {
        throw new Error('Exercise performance insert returned no row');
      }
      if (performance.sets.length > 0) {
        await tx.insert(sets).values(
          performance.sets.map((set, setPosition) => ({
            exercisePerformanceId: perfRow.id,
            userId: data.userId,
            position: setPosition,
            weight: set.weight === null ? null : set.weight.toString(),
            reps: set.reps,
            rir: set.rir,
          })),
        );
      }
    }

    await tx.delete(workoutSessionTags).where(eq(workoutSessionTags.workoutSessionId, data.id));
    if (data.tagIds.length > 0) {
      await tx.insert(workoutSessionTags).values(
        data.tagIds.map((workoutTagId) => ({
          workoutSessionId: data.id,
          workoutTagId,
          userId: data.userId,
        })),
      );
    }

    return session;
  });
}

// Hard delete; cascades to performances, sets, and tag links.
export async function deleteWorkoutSession(
  userId: string,
  id: string,
): Promise<WorkoutSession | undefined> {
  const [row] = await db
    .delete(workoutSessions)
    .where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)))
    .returning();
  return row;
}
