import { z } from 'zod';

import { PLANNED_STATUS_USER_SETTABLE } from '../constants/sessions.constants';

// --- Shared field helpers ---

const sessionName = z.string().trim().min(1, 'Name is required').max(100, 'Name is too long');
const sessionNotes = z.string().trim().max(500, 'Notes are too long').nullish();
// Capped at a day; positive. Nullish = not recorded.
const durationMinutes = z.number().int().positive().max(1440, 'Duration is too long').nullish();
const rating = z.number().int().min(1).max(5).nullish();
// Bare tag-id list: unique uuids, bounded. Create defaults to [], update omits.
const tagIdList = z
  .array(z.uuid())
  .max(20, 'Too many tags')
  .refine((ids) => new Set(ids).size === ids.length, 'Duplicate tags are not allowed');

// --- Sets and performances (strength only) ---

// One logged set. Position comes from array order. All metrics nullish: weight
// null = bodyweight, and a set may be logged with only some fields.
export const logSetSchema = z.object({
  weight: z.number().min(0).max(9999.99).nullish(),
  reps: z.number().int().min(0).max(10000).nullish(),
  rir: z.number().int().min(0).max(5).nullish(),
});

// One exercise performed within a session, with its sets. The swap pair:
// originalExerciseId is what was prescribed, actualExerciseId what was done
// (equal when not swapped, and for ad-hoc strength). Position is array order.
export const logPerformanceSchema = z.object({
  originalExerciseId: z.uuid(),
  actualExerciseId: z.uuid(),
  notes: sessionNotes,
  sets: z.array(logSetSchema).min(1, 'Add at least one set').max(50),
});

// --- Workout sessions (created atomically on "finish workout") ---

// Strength: based on a template (or ad-hoc), with ordered exercises + sets.
// plannedSessionId links the calendar entry being fulfilled (omit for ad-hoc).
export const createStrengthSessionSchema = z.object({
  plannedSessionId: z.uuid().nullish(),
  workoutTemplateId: z.uuid().nullish(),
  name: sessionName,
  performedDate: z.iso.date(),
  durationMinutes,
  rating,
  notes: sessionNotes,
  tagIds: tagIdList.default([]),
  performances: z.array(logPerformanceSchema).min(1, 'Add at least one exercise').max(50),
});

// Activity: a quick log (cardio/yoga/sports). Always ad-hoc — no template, no
// exercises, no planned-session link.
export const createActivitySessionSchema = z.object({
  name: sessionName,
  performedDate: z.iso.date(),
  durationMinutes,
  rating,
  notes: sessionNotes,
  tagIds: tagIdList.default([]),
});

// Post-hoc edits to a finished session's metadata (not its sets). An omitted
// field is left unchanged; tagIds, when present, replaces the whole set.
export const updateWorkoutSessionSchema = z
  .object({
    name: sessionName.optional(),
    rating,
    notes: sessionNotes,
    durationMinutes,
    tagIds: tagIdList.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

// --- Planned sessions (calendar) ---

export const createPlannedSessionSchema = z.object({
  workoutTemplateId: z.uuid(),
  scheduledDate: z.iso.date(),
});

// Skip/unskip (status) and/or reschedule (scheduledDate). 'completed' is system-
// managed, so it isn't user-settable here.
export const updatePlannedSessionSchema = z
  .object({
    status: z.enum(PLANNED_STATUS_USER_SETTABLE).optional(),
    scheduledDate: z.iso.date().optional(),
  })
  .refine((v) => v.status !== undefined || v.scheduledDate !== undefined, {
    message: 'Nothing to update',
  });

// Calendar fetch window (inclusive). The service rejects ranges where to < from.
export const calendarRangeSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

// Workout history pagination. Query params arrive as strings, so coerce; sane
// defaults and an upper bound on page size.
export const workoutHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// --- Active plan ---

// null clears the active plan.
export const setActivePlanSchema = z.object({
  activePlanId: z.uuid().nullable(),
});
