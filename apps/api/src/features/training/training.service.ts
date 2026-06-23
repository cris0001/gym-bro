import { ConflictError, NotFoundError } from '../../lib/errors';
import type { CreateExerciseInput, UpdateExerciseInput } from '@gym-bro/shared';

import type { Exercise } from '../../db/schema/exercises';
import * as trainingRepository from './training.repository';

// Business logic for the training domain — ownership checks, conflict mapping,
// ordering. No Drizzle here; that's the repository. Grown per resource.

type ExerciseCategory = Exercise['category'];

function hasPgCode(value: unknown, code: string): boolean {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code;
}

// Postgres unique_violation (e.g. a duplicate name within the user's scope),
// mapped to a 409. Drizzle wraps the driver error, so the pg code lives on the
// cause; check both levels.
function isUniqueViolation(error: unknown): boolean {
  if (hasPgCode(error, '23505')) {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'cause' in error) {
    return hasPgCode(error.cause, '23505');
  }
  return false;
}

// --- Exercises ---

export function listExercises(userId: string, category?: ExerciseCategory): Promise<Exercise[]> {
  return trainingRepository.listExercises(userId, category);
}

export async function createExercise(
  userId: string,
  input: CreateExerciseInput,
): Promise<Exercise> {
  try {
    return await trainingRepository.createExercise({ userId, ...input });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('An exercise with this name already exists');
    }
    throw error;
  }
}

export async function updateExercise(
  userId: string,
  id: string,
  input: UpdateExerciseInput,
): Promise<Exercise> {
  const existing = await trainingRepository.findExerciseById(userId, id);
  if (!existing) {
    throw new NotFoundError('Exercise not found');
  }
  try {
    const updated = await trainingRepository.updateExercise(userId, id, input);
    if (!updated) {
      throw new NotFoundError('Exercise not found');
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('An exercise with this name already exists');
    }
    throw error;
  }
}

export async function deleteExercise(userId: string, id: string): Promise<void> {
  const deleted = await trainingRepository.softDeleteExercise(userId, id);
  if (!deleted) {
    throw new NotFoundError('Exercise not found');
  }
}
