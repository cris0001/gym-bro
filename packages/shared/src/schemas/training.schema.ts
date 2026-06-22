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
