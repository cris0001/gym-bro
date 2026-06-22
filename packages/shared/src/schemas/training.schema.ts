import { z } from 'zod';

import { EXERCISE_CATEGORIES } from '../constants/training.constants';

// Request validation for the training domain — single source of truth shared by
// the API (body validation) and the web (form types). Grown per resource.

// --- Exercises ---

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  category: z.enum(EXERCISE_CATEGORIES),
});

// PATCH accepts any subset of the creatable fields.
export const updateExerciseSchema = createExerciseSchema.partial();

// --- Training plans ---

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  // nullish: omit on create, or send null to clear on update.
  description: z.string().trim().max(500, 'Description is too long').nullish(),
});

export const updatePlanSchema = createPlanSchema.partial();

// --- Workout templates (days within a plan) ---
// planId comes from the URL; position is auto-assigned on create.

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().trim().max(500, 'Description is too long').nullish(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// --- Reordering ---
// Shared by the template and template-exercise reorder endpoints (decision 3A):
// the full ordered list of ids; the service renumbers position in one txn.
export const reorderSchema = z.object({
  orderedIds: z
    .array(z.uuid())
    .min(1, 'At least one id is required')
    .refine((ids) => new Set(ids).size === ids.length, 'Duplicate ids are not allowed'),
});

// --- Template exercises (the join rows) ---
// templateId comes from the URL; position is auto-assigned on create.

const REPS_RANGE_MESSAGE = 'Max reps must be greater than or equal to min reps';
const repCount = z.number().int().positive().max(999);

// Base object so both create and update can derive from it — a refined schema
// (ZodEffects) can't be .partial()'d.
const templateExerciseBase = z.object({
  exerciseId: z.uuid(),
  targetSets: z.number().int().positive().max(99).nullish(),
  targetRepsMin: repCount.nullish(),
  targetRepsMax: repCount.nullish(),
  notes: z.string().trim().max(500, 'Notes are too long').nullish(),
});

export const createTemplateExerciseSchema = templateExerciseBase.refine(
  (v) => v.targetRepsMin == null || v.targetRepsMax == null || v.targetRepsMax >= v.targetRepsMin,
  { message: REPS_RANGE_MESSAGE, path: ['targetRepsMax'] },
);

// exerciseId is fixed once added — to swap the exercise, delete and re-add.
export const updateTemplateExerciseSchema = templateExerciseBase
  .omit({ exerciseId: true })
  .partial()
  .refine(
    (v) => v.targetRepsMin == null || v.targetRepsMax == null || v.targetRepsMax >= v.targetRepsMin,
    { message: REPS_RANGE_MESSAGE, path: ['targetRepsMax'] },
  );

// --- Workout tags ---

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  // 6-digit hex; mirrors the workout_tags_color_hex DB CHECK.
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Enter a valid hex color, e.g. #22c55e'),
});

export const updateTagSchema = createTagSchema.partial();
