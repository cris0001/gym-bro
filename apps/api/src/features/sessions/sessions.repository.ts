import { and, between, eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { plannedSessions, type PlannedSession } from '../../db/schema/planned-sessions';
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
    })
    .from(plannedSessions)
    .innerJoin(workoutTemplates, eq(plannedSessions.workoutTemplateId, workoutTemplates.id))
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
