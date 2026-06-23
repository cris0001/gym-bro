import { ConflictError, NotFoundError } from '../../lib/errors';
import type {
  CreateExerciseInput,
  CreateTagInput,
  UpdateExerciseInput,
  UpdateTagInput,
} from '@gym-bro/shared';

import type { Exercise } from '../../db/schema/exercises';
import type { WorkoutTag } from '../../db/schema/workout-tags';
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

// --- Tags ---

export function listTags(userId: string): Promise<WorkoutTag[]> {
  return trainingRepository.listTags(userId);
}

export async function createTag(userId: string, input: CreateTagInput): Promise<WorkoutTag> {
  try {
    return await trainingRepository.createTag({ userId, ...input });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A tag with this name already exists');
    }
    throw error;
  }
}

export async function updateTag(
  userId: string,
  id: string,
  input: UpdateTagInput,
): Promise<WorkoutTag> {
  const existing = await trainingRepository.findTagById(userId, id);
  if (!existing) {
    throw new NotFoundError('Tag not found');
  }
  try {
    const updated = await trainingRepository.updateTag(userId, id, input);
    if (!updated) {
      throw new NotFoundError('Tag not found');
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A tag with this name already exists');
    }
    throw error;
  }
}

export async function deleteTag(userId: string, id: string): Promise<void> {
  const deleted = await trainingRepository.softDeleteTag(userId, id);
  if (!deleted) {
    throw new NotFoundError('Tag not found');
  }
}
