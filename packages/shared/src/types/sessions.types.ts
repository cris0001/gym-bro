import type { z } from 'zod';

import type { PLANNED_STATUSES, SESSION_TYPES } from '../constants/sessions.constants';
import type {
  calendarRangeSchema,
  createActivitySessionSchema,
  createPlannedSessionSchema,
  createStrengthSessionSchema,
  logPerformanceSchema,
  logSetSchema,
  setActivePlanSchema,
  updatePlannedSessionSchema,
  updateWorkoutSessionSchema,
} from '../schemas/sessions.schema';
import type { Exercise, WorkoutTag, WorkoutTemplate } from './training.types';

// --- Inferred request inputs ---

export type LogSetInput = z.infer<typeof logSetSchema>;
export type LogPerformanceInput = z.infer<typeof logPerformanceSchema>;
export type CreateStrengthSessionInput = z.infer<typeof createStrengthSessionSchema>;
export type CreateActivitySessionInput = z.infer<typeof createActivitySessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof updateWorkoutSessionSchema>;
export type CreatePlannedSessionInput = z.infer<typeof createPlannedSessionSchema>;
export type UpdatePlannedSessionInput = z.infer<typeof updatePlannedSessionSchema>;
export type CalendarRangeInput = z.infer<typeof calendarRangeSchema>;
export type SetActivePlanInput = z.infer<typeof setActivePlanSchema>;

export type SessionType = (typeof SESSION_TYPES)[number];
export type PlannedStatus = (typeof PLANNED_STATUSES)[number];

// --- Wire entity shapes (as returned by the API: timestamps are ISO strings;
// date columns are 'YYYY-MM-DD' strings; numeric weight is coerced to a number
// by the service) ---

export interface PlannedSession {
  id: string;
  userId: string;
  workoutTemplateId: string;
  scheduledDate: string;
  status: PlannedStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  plannedSessionId: string | null;
  workoutTemplateId: string | null;
  sessionType: SessionType;
  name: string;
  performedDate: string;
  durationMinutes: number | null;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisePerformance {
  id: string;
  workoutSessionId: string;
  userId: string;
  originalExerciseId: string;
  actualExerciseId: string;
  position: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  exercisePerformanceId: string;
  userId: string;
  position: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  createdAt: string;
  updatedAt: string;
}

// --- Composite response shapes ---

type ExerciseIdentity = Pick<Exercise, 'id' | 'name' | 'category' | 'isActive'>;

// A performance with its ordered sets and the exercises it references. `exercise`
// is what was actually done; `originalExercise` is what was prescribed (equal
// unless swapped). isActive surfaces a soft-deleted-but-referenced exercise.
export interface PerformanceWithSets extends ExercisePerformance {
  exercise: ExerciseIdentity;
  originalExercise: ExerciseIdentity;
  sets: WorkoutSet[];
}

// GET /api/workout-sessions/:id — the full session graph (strength sessions have
// performances; activity sessions have an empty array). Tags are the labels
// attached at finish.
export interface WorkoutSessionDetail extends WorkoutSession {
  performances: PerformanceWithSets[];
  tags: Pick<WorkoutTag, 'id' | 'name' | 'color' | 'isActive'>[];
}

// History list item — a session with just its tags (no performances/sets).
export interface WorkoutSessionListItem extends WorkoutSession {
  tags: Pick<WorkoutTag, 'id' | 'name' | 'color' | 'isActive'>[];
}

// A calendar entry: a planned session with its template's name for display.
export interface PlannedSessionWithTemplate extends PlannedSession {
  template: Pick<WorkoutTemplate, 'id' | 'name'>;
}
