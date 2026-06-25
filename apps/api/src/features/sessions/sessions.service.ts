import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import type {
  CalendarRangeInput,
  CreateActivitySessionInput,
  CreatePlannedSessionInput,
  CreateStrengthSessionInput,
  ExerciseHistoryQueryInput,
  UpdatePlannedSessionInput,
  UpdateStrengthSessionInput,
  UpdateWorkoutSessionInput,
  WorkoutHistoryQueryInput,
} from '@gym-bro/shared';

import type { PlannedSession } from '../../db/schema/planned-sessions';
import type { WorkoutSession } from '../../db/schema/workout-sessions';
import type { WorkoutTemplate } from '../../db/schema/workout-templates';
import * as trainingRepository from '../training/training.repository';
import * as sessionsRepository from './sessions.repository';

// Business logic for the sessions domain — ownership checks, conflict mapping.
// No Drizzle here. Reuses training's findTemplateById for the ownership chain.

function hasPgCode(value: unknown, code: string): boolean {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code;
}

// Postgres unique_violation, mapped to a 409. Drizzle wraps the driver error so
// the pg code lives on the cause; check both levels. (Same check as the training
// service; kept local to keep the feature self-contained.)
function isUniqueViolation(error: unknown): boolean {
  if (hasPgCode(error, '23505')) {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'cause' in error) {
    return hasPgCode(error.cause, '23505');
  }
  return false;
}

// --- Planned sessions ---

interface PlannedSessionWithTemplate extends PlannedSession {
  template: Pick<WorkoutTemplate, 'id' | 'name'>;
  workoutSessionId: string | null;
}

// Calendar entries in a date window, each with its template name.
export async function listPlannedSessions(
  userId: string,
  range: CalendarRangeInput,
): Promise<PlannedSessionWithTemplate[]> {
  if (range.to < range.from) {
    throw new ValidationError('"to" must be on or after "from"');
  }
  const rows = await sessionsRepository.listPlannedSessionsByRange(userId, range.from, range.to);
  return rows.map(({ templateName, ...planned }) => ({
    ...planned,
    template: { id: planned.workoutTemplateId, name: templateName },
  }));
}

// Assign a template to a date. The template must belong to the user; scheduling
// the same template twice on a day hits the unique index → 409.
export async function createPlannedSession(
  userId: string,
  input: CreatePlannedSessionInput,
): Promise<PlannedSession> {
  const template = await trainingRepository.findTemplateById(userId, input.workoutTemplateId);
  if (!template) {
    throw new NotFoundError('Template not found');
  }
  try {
    return await sessionsRepository.createPlannedSession({
      userId,
      workoutTemplateId: input.workoutTemplateId,
      scheduledDate: input.scheduledDate,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('This template is already scheduled on that date');
    }
    throw error;
  }
}

// Skip/unskip and/or reschedule. Rescheduling onto a date that already has this
// template also hits the unique index → 409.
export async function updatePlannedSession(
  userId: string,
  id: string,
  input: UpdatePlannedSessionInput,
): Promise<PlannedSession> {
  const existing = await sessionsRepository.findPlannedSessionById(userId, id);
  if (!existing) {
    throw new NotFoundError('Planned session not found');
  }
  try {
    const updated = await sessionsRepository.updatePlannedSession(userId, id, input);
    if (!updated) {
      throw new NotFoundError('Planned session not found');
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('This template is already scheduled on that date');
    }
    throw error;
  }
}

export async function deletePlannedSession(userId: string, id: string): Promise<void> {
  const deleted = await sessionsRepository.deletePlannedSession(userId, id);
  if (!deleted) {
    throw new NotFoundError('Planned session not found');
  }
}

// --- Workout sessions ---

// Body references must belong to the user (the FKs only enforce existence). A bad
// reference is a 400, not a 404 — it's invalid input, not a missing endpoint.
async function assertExercisesOwned(userId: string, exerciseIds: Set<string>): Promise<void> {
  for (const id of exerciseIds) {
    const exercise = await trainingRepository.findExerciseById(userId, id);
    if (!exercise) {
      throw new ValidationError('One or more exercises are not available');
    }
  }
}

async function assertTagsOwned(userId: string, tagIds: string[]): Promise<void> {
  for (const id of tagIds) {
    const tag = await trainingRepository.findTagById(userId, id);
    if (!tag) {
      throw new ValidationError('One or more tags are not available');
    }
  }
}

interface SessionTagRow {
  workoutSessionId: string;
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

function groupTagsBySession(
  rows: SessionTagRow[],
): Map<string, Omit<SessionTagRow, 'workoutSessionId'>[]> {
  const map = new Map<string, Omit<SessionTagRow, 'workoutSessionId'>[]>();
  for (const { workoutSessionId, ...tag } of rows) {
    const existing = map.get(workoutSessionId) ?? [];
    existing.push(tag);
    map.set(workoutSessionId, existing);
  }
  return map;
}

// Finish a strength workout: validate every body reference (planned session,
// template, each exercise of the swap pair, each tag), then write the whole graph
// atomically in the repository transaction.
export async function createStrengthSession(
  userId: string,
  input: CreateStrengthSessionInput,
): Promise<WorkoutSession> {
  if (input.plannedSessionId != null) {
    const planned = await sessionsRepository.findPlannedSessionById(userId, input.plannedSessionId);
    if (!planned) {
      throw new ValidationError('Planned session not found');
    }
  }
  if (input.workoutTemplateId != null) {
    const template = await trainingRepository.findTemplateById(userId, input.workoutTemplateId);
    if (!template) {
      throw new ValidationError('Template not found or unavailable');
    }
  }
  const exerciseIds = new Set<string>();
  for (const performance of input.performances) {
    exerciseIds.add(performance.originalExerciseId);
    exerciseIds.add(performance.actualExerciseId);
  }
  await assertExercisesOwned(userId, exerciseIds);
  await assertTagsOwned(userId, input.tagIds);

  return sessionsRepository.createStrengthSession({
    userId,
    plannedSessionId: input.plannedSessionId ?? null,
    workoutTemplateId: input.workoutTemplateId ?? null,
    name: input.name,
    performedDate: input.performedDate,
    durationMinutes: input.durationMinutes ?? null,
    rating: input.rating ?? null,
    notes: input.notes ?? null,
    performances: input.performances.map((performance) => ({
      originalExerciseId: performance.originalExerciseId,
      actualExerciseId: performance.actualExerciseId,
      notes: performance.notes ?? null,
      sets: performance.sets.map((set) => ({
        weight: set.weight ?? null,
        reps: set.reps ?? null,
        rir: set.rir ?? null,
      })),
    })),
    tagIds: input.tagIds,
  });
}

export async function createActivitySession(
  userId: string,
  input: CreateActivitySessionInput,
): Promise<WorkoutSession> {
  await assertTagsOwned(userId, input.tagIds);
  return sessionsRepository.createActivitySession({
    userId,
    name: input.name,
    performedDate: input.performedDate,
    durationMinutes: input.durationMinutes ?? null,
    rating: input.rating ?? null,
    notes: input.notes ?? null,
    tagIds: input.tagIds,
  });
}

// One page of history with each session's tags attached.
export async function listWorkoutSessions(userId: string, query: WorkoutHistoryQueryInput) {
  const [items, total] = await Promise.all([
    sessionsRepository.listWorkoutSessionsPage(
      userId,
      query.limit,
      query.offset,
      query.from,
      query.to,
    ),
    sessionsRepository.countWorkoutSessions(userId, query.from, query.to),
  ]);
  const tagsBySession = groupTagsBySession(
    await sessionsRepository.listTagsForSessions(
      userId,
      items.map((session) => session.id),
    ),
  );
  return {
    items: items.map((session) => ({ ...session, tags: tagsBySession.get(session.id) ?? [] })),
    total,
  };
}

// The full session graph: performances (with exercise identity) grouped with
// their ordered sets, plus the session's tags.
export async function getWorkoutSession(userId: string, id: string) {
  const session = await sessionsRepository.findWorkoutSessionById(userId, id);
  if (!session) {
    throw new NotFoundError('Workout session not found');
  }
  const [performanceRows, setRows, tagRows] = await Promise.all([
    sessionsRepository.listPerformancesForSession(userId, id),
    sessionsRepository.listSetsForSession(userId, id),
    sessionsRepository.listTagsForSessions(userId, [id]),
  ]);

  const setsByPerformance = new Map<string, typeof setRows>();
  for (const set of setRows) {
    const existing = setsByPerformance.get(set.exercisePerformanceId) ?? [];
    existing.push(set);
    setsByPerformance.set(set.exercisePerformanceId, existing);
  }

  const performances = performanceRows.map(({ actual, original, ...performance }) => ({
    ...performance,
    exercise: actual,
    originalExercise: original,
    sets: setsByPerformance.get(performance.id) ?? [],
  }));
  const tags = groupTagsBySession(tagRows).get(id) ?? [];

  return { ...session, performances, tags };
}

// Previous performances of an exercise (for the "last time" panels). The exercise
// must belong to the user — a missing/foreign one is a 404, since the id comes
// from the URL, not the request body.
export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  query: ExerciseHistoryQueryInput,
) {
  const exercise = await trainingRepository.findExerciseById(userId, exerciseId);
  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }
  return sessionsRepository.findExerciseHistory(userId, exerciseId, query.before, query.limit);
}

// Edit metadata and/or replace the tag set. Returns the refreshed detail.
export async function updateWorkoutSession(
  userId: string,
  id: string,
  input: UpdateWorkoutSessionInput,
) {
  const existing = await sessionsRepository.findWorkoutSessionById(userId, id);
  if (!existing) {
    throw new NotFoundError('Workout session not found');
  }
  const { tagIds, ...meta } = input;
  if (tagIds !== undefined) {
    await assertTagsOwned(userId, tagIds);
  }
  const updated = await sessionsRepository.updateWorkoutSession(userId, id, meta, tagIds);
  if (!updated) {
    throw new NotFoundError('Workout session not found');
  }
  return getWorkoutSession(userId, id);
}

// Edit a finished strength workout: replace its whole graph. Validates ownership
// (404) and every exercise/tag reference (400), then returns the refreshed detail.
export async function replaceStrengthSession(
  userId: string,
  id: string,
  input: UpdateStrengthSessionInput,
) {
  const existing = await sessionsRepository.findWorkoutSessionById(userId, id);
  if (!existing) {
    throw new NotFoundError('Workout session not found');
  }
  const exerciseIds = new Set<string>();
  for (const performance of input.performances) {
    exerciseIds.add(performance.originalExerciseId);
    exerciseIds.add(performance.actualExerciseId);
  }
  await assertExercisesOwned(userId, exerciseIds);
  await assertTagsOwned(userId, input.tagIds);

  const updated = await sessionsRepository.replaceStrengthSession({
    userId,
    id,
    name: input.name,
    performedDate: input.performedDate,
    durationMinutes: input.durationMinutes ?? null,
    rating: input.rating ?? null,
    notes: input.notes ?? null,
    performances: input.performances.map((performance) => ({
      originalExerciseId: performance.originalExerciseId,
      actualExerciseId: performance.actualExerciseId,
      notes: performance.notes ?? null,
      sets: performance.sets.map((set) => ({
        weight: set.weight ?? null,
        reps: set.reps ?? null,
        rir: set.rir ?? null,
      })),
    })),
    tagIds: input.tagIds,
  });
  if (!updated) {
    throw new NotFoundError('Workout session not found');
  }
  return getWorkoutSession(userId, id);
}

export async function deleteWorkoutSession(userId: string, id: string): Promise<void> {
  const deleted = await sessionsRepository.deleteWorkoutSession(userId, id);
  if (!deleted) {
    throw new NotFoundError('Workout session not found');
  }
  // If this workout fulfilled a planned session, revert that calendar entry to
  // 'planned' so it no longer shows as done now that the workout is gone.
  if (deleted.plannedSessionId !== null) {
    await sessionsRepository.updatePlannedSession(userId, deleted.plannedSessionId, {
      status: 'planned',
    });
  }
}
