import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import type {
  CalendarRangeInput,
  CreatePlannedSessionInput,
  UpdatePlannedSessionInput,
} from '@gym-bro/shared';

import type { PlannedSession } from '../../db/schema/planned-sessions';
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
