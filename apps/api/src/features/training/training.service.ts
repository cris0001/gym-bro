import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import type {
  CreateExerciseInput,
  CreatePlanInput,
  CreateTagInput,
  CreateTemplateInput,
  ReorderInput,
  UpdateExerciseInput,
  UpdatePlanInput,
  UpdateTagInput,
  UpdateTemplateInput,
} from '@gym-bro/shared';

import type { Exercise } from '../../db/schema/exercises';
import type { TrainingPlan } from '../../db/schema/training-plans';
import type { WorkoutTemplate } from '../../db/schema/workout-templates';
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

// --- Plans ---

interface PlanListItem extends TrainingPlan {
  templateCount: number;
}

interface PlanWithTemplates extends TrainingPlan {
  templates: WorkoutTemplate[];
}

export function listPlans(userId: string): Promise<PlanListItem[]> {
  return trainingRepository.listPlansWithTemplateCount(userId);
}

// Detail view (decision 4A): the plan with its templates ordered by position.
export async function getPlan(userId: string, id: string): Promise<PlanWithTemplates> {
  const plan = await trainingRepository.findPlanById(userId, id);
  if (!plan) {
    throw new NotFoundError('Plan not found');
  }
  const templates = await trainingRepository.listTemplatesByPlan(userId, id);
  return { ...plan, templates };
}

export async function createPlan(userId: string, input: CreatePlanInput): Promise<TrainingPlan> {
  try {
    return await trainingRepository.createPlan({ userId, ...input });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A plan with this name already exists');
    }
    throw error;
  }
}

export async function updatePlan(
  userId: string,
  id: string,
  input: UpdatePlanInput,
): Promise<TrainingPlan> {
  const existing = await trainingRepository.findPlanById(userId, id);
  if (!existing) {
    throw new NotFoundError('Plan not found');
  }
  try {
    const updated = await trainingRepository.updatePlan(userId, id, input);
    if (!updated) {
      throw new NotFoundError('Plan not found');
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A plan with this name already exists');
    }
    throw error;
  }
}

export async function deletePlan(userId: string, id: string): Promise<void> {
  const deleted = await trainingRepository.deletePlan(userId, id);
  if (!deleted) {
    throw new NotFoundError('Plan not found');
  }
}

// --- Templates ---

// Nested create: the template lands in the parent plan, so the plan must exist
// and belong to the user. Position is auto-assigned to the end of the plan.
export async function createTemplate(
  userId: string,
  planId: string,
  input: CreateTemplateInput,
): Promise<WorkoutTemplate> {
  const plan = await trainingRepository.findPlanById(userId, planId);
  if (!plan) {
    throw new NotFoundError('Plan not found');
  }
  const position = await trainingRepository.getNextTemplatePosition(planId);
  try {
    return await trainingRepository.createTemplate({
      trainingPlanId: planId,
      userId,
      ...input,
      position,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A template with this name already exists in this plan');
    }
    throw error;
  }
}

export async function updateTemplate(
  userId: string,
  id: string,
  input: UpdateTemplateInput,
): Promise<WorkoutTemplate> {
  const existing = await trainingRepository.findTemplateById(userId, id);
  if (!existing) {
    throw new NotFoundError('Template not found');
  }
  try {
    const updated = await trainingRepository.updateTemplate(userId, id, input);
    if (!updated) {
      throw new NotFoundError('Template not found');
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A template with this name already exists in this plan');
    }
    throw error;
  }
}

export async function deleteTemplate(userId: string, id: string): Promise<void> {
  const deleted = await trainingRepository.deleteTemplate(userId, id);
  if (!deleted) {
    throw new NotFoundError('Template not found');
  }
}

// Reorder requires the complete set of the plan's templates (decision: full-set
// reorder). Validate ownership and that orderedIds matches the plan's current
// templates exactly before renumbering in a transaction.
export async function reorderTemplates(
  userId: string,
  planId: string,
  input: ReorderInput,
): Promise<WorkoutTemplate[]> {
  const plan = await trainingRepository.findPlanById(userId, planId);
  if (!plan) {
    throw new NotFoundError('Plan not found');
  }
  const current = await trainingRepository.listTemplatesByPlan(userId, planId);
  const currentIds = new Set(current.map((template) => template.id));
  const sameSize = input.orderedIds.length === currentIds.size;
  const allKnown = input.orderedIds.every((id) => currentIds.has(id));
  if (!sameSize || !allKnown) {
    throw new ValidationError('orderedIds must list every template in this plan exactly once');
  }
  return trainingRepository.reorderTemplates(userId, planId, input.orderedIds);
}
