import type { z } from 'zod';

import type {
  createExerciseSchema,
  createPlanSchema,
  createTagSchema,
  createTemplateExerciseSchema,
  createTemplateSchema,
  reorderSchema,
  updateExerciseSchema,
  updatePlanSchema,
  updateTagSchema,
  updateTemplateExerciseSchema,
  updateTemplateSchema,
} from '../schemas/training.schema';

// --- Inferred request inputs ---

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
export type CreateTemplateExerciseInput = z.infer<typeof createTemplateExerciseSchema>;
export type UpdateTemplateExerciseInput = z.infer<typeof updateTemplateExerciseSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export type ExerciseCategory = CreateExerciseInput['category'];

// --- Wire entity shapes (as returned by the API: timestamps are ISO strings,
// the same JSON-serialized convention as PublicUser) ---

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  category: ExerciseCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplate {
  id: string;
  trainingPlanId: string;
  userId: string;
  name: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  userId: string;
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  notes: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Composite response shapes (decision 4A: embedded GET detail) ---

// GET /api/plans — each plan with a count of its templates.
export interface PlanListItem extends TrainingPlan {
  templateCount: number;
}

// GET /api/plans/:id — a plan with its ordered templates.
export interface PlanWithTemplates extends TrainingPlan {
  templates: WorkoutTemplate[];
}

// A template-exercise row joined with its exercise's identity (so the builder
// can render the name/category without a second lookup). isActive surfaces a
// soft-deleted exercise still referenced by the template.
export interface TemplateExerciseWithExercise extends WorkoutTemplateExercise {
  exercise: Pick<Exercise, 'id' | 'name' | 'category' | 'isActive'>;
}

// GET /api/templates/:id — a template with its ordered exercises.
export interface TemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExerciseWithExercise[];
}
