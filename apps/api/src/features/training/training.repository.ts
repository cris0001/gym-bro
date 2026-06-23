import { and, count, eq, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { exercises, type Exercise } from '../../db/schema/exercises';
import { trainingPlans, type TrainingPlan } from '../../db/schema/training-plans';
import { workoutTemplates, type WorkoutTemplate } from '../../db/schema/workout-templates';
import {
  workoutTemplateExercises,
  type WorkoutTemplateExercise,
} from '../../db/schema/workout-template-exercises';
import { workoutTags, type WorkoutTag } from '../../db/schema/workout-tags';

// Drizzle queries for the training domain — return plain rows, no business
// logic. Every query is scoped by userId. Grown per resource.

type ExerciseCategory = Exercise['category'];

// Fields editable via PATCH; undefined-able to line up with the Zod-inferred
// input under exactOptionalPropertyTypes (same as auth's ProfileUpdate).
interface ExerciseUpdate {
  name?: string | undefined;
  category?: ExerciseCategory | undefined;
}

// --- Exercises ---

// Active exercises only (decision 5A), case-insensitive name order, optionally
// filtered by category.
export async function listExercises(
  userId: string,
  category?: ExerciseCategory,
): Promise<Exercise[]> {
  return db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.userId, userId),
        eq(exercises.isActive, true),
        category ? eq(exercises.category, category) : undefined,
      ),
    )
    .orderBy(sql`lower(${exercises.name})`);
}

// Active row scoped by user; a soft-deleted exercise reads as not found.
export async function findExerciseById(userId: string, id: string): Promise<Exercise | undefined> {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId), eq(exercises.isActive, true)))
    .limit(1);
  return exercise;
}

export async function createExercise(data: {
  userId: string;
  name: string;
  category: ExerciseCategory;
}): Promise<Exercise> {
  const [exercise] = await db.insert(exercises).values(data).returning();
  if (!exercise) {
    throw new Error('Exercise insert returned no row');
  }
  return exercise;
}

export async function updateExercise(
  userId: string,
  id: string,
  data: ExerciseUpdate,
): Promise<Exercise | undefined> {
  const [exercise] = await db
    .update(exercises)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId), eq(exercises.isActive, true)))
    .returning();
  return exercise;
}

export async function softDeleteExercise(
  userId: string,
  id: string,
): Promise<Exercise | undefined> {
  const [exercise] = await db
    .update(exercises)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId), eq(exercises.isActive, true)))
    .returning();
  return exercise;
}

// --- Tags ---

// Fields editable via PATCH; undefined-able to line up with the Zod-inferred
// input under exactOptionalPropertyTypes.
interface TagUpdate {
  name?: string | undefined;
  color?: string | undefined;
}

// Active tags only, case-insensitive name order.
export async function listTags(userId: string): Promise<WorkoutTag[]> {
  return db
    .select()
    .from(workoutTags)
    .where(and(eq(workoutTags.userId, userId), eq(workoutTags.isActive, true)))
    .orderBy(sql`lower(${workoutTags.name})`);
}

// Active row scoped by user; a soft-deleted tag reads as not found.
export async function findTagById(userId: string, id: string): Promise<WorkoutTag | undefined> {
  const [tag] = await db
    .select()
    .from(workoutTags)
    .where(
      and(eq(workoutTags.id, id), eq(workoutTags.userId, userId), eq(workoutTags.isActive, true)),
    )
    .limit(1);
  return tag;
}

export async function createTag(data: {
  userId: string;
  name: string;
  color: string;
}): Promise<WorkoutTag> {
  const [tag] = await db.insert(workoutTags).values(data).returning();
  if (!tag) {
    throw new Error('Tag insert returned no row');
  }
  return tag;
}

export async function updateTag(
  userId: string,
  id: string,
  data: TagUpdate,
): Promise<WorkoutTag | undefined> {
  const [tag] = await db
    .update(workoutTags)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(workoutTags.id, id), eq(workoutTags.userId, userId), eq(workoutTags.isActive, true)),
    )
    .returning();
  return tag;
}

export async function softDeleteTag(userId: string, id: string): Promise<WorkoutTag | undefined> {
  const [tag] = await db
    .update(workoutTags)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(eq(workoutTags.id, id), eq(workoutTags.userId, userId), eq(workoutTags.isActive, true)),
    )
    .returning();
  return tag;
}

// --- Plans ---

// Editable via PATCH; description is nullable so it can be cleared.
interface PlanUpdate {
  name?: string | undefined;
  description?: string | null | undefined;
}

// A plan row with its number of templates, for the list view (decision 4A).
interface PlanListRow extends TrainingPlan {
  templateCount: number;
}

// Plans are hard-deleted (no is_active), so the list is every plan the user
// owns. LEFT JOIN keeps plans with zero templates; group by the PK is enough
// since the other columns are functionally dependent on it.
export async function listPlansWithTemplateCount(userId: string): Promise<PlanListRow[]> {
  return db
    .select({
      id: trainingPlans.id,
      userId: trainingPlans.userId,
      name: trainingPlans.name,
      description: trainingPlans.description,
      createdAt: trainingPlans.createdAt,
      updatedAt: trainingPlans.updatedAt,
      templateCount: count(workoutTemplates.id),
    })
    .from(trainingPlans)
    .leftJoin(workoutTemplates, eq(workoutTemplates.trainingPlanId, trainingPlans.id))
    .where(eq(trainingPlans.userId, userId))
    .groupBy(trainingPlans.id)
    .orderBy(sql`lower(${trainingPlans.name})`);
}

export async function findPlanById(userId: string, id: string): Promise<TrainingPlan | undefined> {
  const [plan] = await db
    .select()
    .from(trainingPlans)
    .where(and(eq(trainingPlans.id, id), eq(trainingPlans.userId, userId)))
    .limit(1);
  return plan;
}

// Templates of a plan, ordered for the plan detail embed (decision 4A). Scoped
// by user as a defense-in-depth check on top of the plan ownership lookup.
export async function listTemplatesByPlan(
  userId: string,
  planId: string,
): Promise<WorkoutTemplate[]> {
  return db
    .select()
    .from(workoutTemplates)
    .where(and(eq(workoutTemplates.trainingPlanId, planId), eq(workoutTemplates.userId, userId)))
    .orderBy(workoutTemplates.position);
}

export async function createPlan(data: {
  userId: string;
  name: string;
  description?: string | null | undefined;
}): Promise<TrainingPlan> {
  const [plan] = await db.insert(trainingPlans).values(data).returning();
  if (!plan) {
    throw new Error('Plan insert returned no row');
  }
  return plan;
}

export async function updatePlan(
  userId: string,
  id: string,
  data: PlanUpdate,
): Promise<TrainingPlan | undefined> {
  const [plan] = await db
    .update(trainingPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(trainingPlans.id, id), eq(trainingPlans.userId, userId)))
    .returning();
  return plan;
}

// Hard delete; cascades to the plan's templates and their template-exercises.
export async function deletePlan(userId: string, id: string): Promise<TrainingPlan | undefined> {
  const [plan] = await db
    .delete(trainingPlans)
    .where(and(eq(trainingPlans.id, id), eq(trainingPlans.userId, userId)))
    .returning();
  return plan;
}

// --- Templates ---

// Editable via PATCH; description is nullable so it can be cleared.
interface TemplateUpdate {
  name?: string | undefined;
  description?: string | null | undefined;
}

// Large enough that offset positions can't collide with final 0..n-1 values
// during a reorder (we always renumber down to a dense 0-based range).
const REORDER_OFFSET = 1_000_000;

export async function findTemplateById(
  userId: string,
  id: string,
): Promise<WorkoutTemplate | undefined> {
  const [template] = await db
    .select()
    .from(workoutTemplates)
    .where(and(eq(workoutTemplates.id, id), eq(workoutTemplates.userId, userId)))
    .limit(1);
  return template;
}

// Next append position for a plan: one past the current max, or 0 when empty.
export async function getNextTemplatePosition(planId: string): Promise<number> {
  const [row] = await db
    .select({ next: sql<number>`coalesce(max(${workoutTemplates.position}) + 1, 0)` })
    .from(workoutTemplates)
    .where(eq(workoutTemplates.trainingPlanId, planId));
  return row?.next ?? 0;
}

export async function createTemplate(data: {
  trainingPlanId: string;
  userId: string;
  name: string;
  description?: string | null | undefined;
  position: number;
}): Promise<WorkoutTemplate> {
  const [template] = await db.insert(workoutTemplates).values(data).returning();
  if (!template) {
    throw new Error('Template insert returned no row');
  }
  return template;
}

export async function updateTemplate(
  userId: string,
  id: string,
  data: TemplateUpdate,
): Promise<WorkoutTemplate | undefined> {
  const [template] = await db
    .update(workoutTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workoutTemplates.id, id), eq(workoutTemplates.userId, userId)))
    .returning();
  return template;
}

// Hard delete; cascades to the template's template-exercise rows.
export async function deleteTemplate(
  userId: string,
  id: string,
): Promise<WorkoutTemplate | undefined> {
  const [template] = await db
    .delete(workoutTemplates)
    .where(and(eq(workoutTemplates.id, id), eq(workoutTemplates.userId, userId)))
    .returning();
  return template;
}

// Renumber a plan's templates to match orderedIds (0-based, dense). Two phases
// in one transaction: first shift every row past the final range so the
// unique(plan_id, position) index can't collide mid-update, then set the final
// positions. Returns the templates in their new order.
export async function reorderTemplates(
  userId: string,
  planId: string,
  orderedIds: string[],
): Promise<WorkoutTemplate[]> {
  return db.transaction(async (tx) => {
    await tx
      .update(workoutTemplates)
      .set({
        position: sql`${workoutTemplates.position} + ${REORDER_OFFSET}`,
        updatedAt: new Date(),
      })
      .where(and(eq(workoutTemplates.trainingPlanId, planId), eq(workoutTemplates.userId, userId)));

    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(workoutTemplates)
        .set({ position: index, updatedAt: new Date() })
        .where(
          and(
            eq(workoutTemplates.id, id),
            eq(workoutTemplates.trainingPlanId, planId),
            eq(workoutTemplates.userId, userId),
          ),
        );
    }

    return tx
      .select()
      .from(workoutTemplates)
      .where(and(eq(workoutTemplates.trainingPlanId, planId), eq(workoutTemplates.userId, userId)))
      .orderBy(workoutTemplates.position);
  });
}

// --- Template exercises ---

// Editable via PATCH; exercise_id is fixed once added (swap = delete + add). All
// nullable so a field can be cleared back to "no target".
interface TemplateExerciseUpdate {
  targetSets?: number | null | undefined;
  targetRepsMin?: number | null | undefined;
  targetRepsMax?: number | null | undefined;
  notes?: string | null | undefined;
}

// A template-exercise joined with its exercise's identity, for the template
// detail embed (decision 4A). exercise.isActive surfaces a soft-deleted exercise
// that a template still references.
interface TemplateExerciseWithExerciseRow extends WorkoutTemplateExercise {
  exercise: Pick<Exercise, 'id' | 'name' | 'category' | 'isActive'>;
}

export async function findTemplateExerciseById(
  userId: string,
  id: string,
): Promise<WorkoutTemplateExercise | undefined> {
  const [row] = await db
    .select()
    .from(workoutTemplateExercises)
    .where(and(eq(workoutTemplateExercises.id, id), eq(workoutTemplateExercises.userId, userId)))
    .limit(1);
  return row;
}

// Ordered exercises of a template for the detail embed. INNER JOIN is safe:
// exercise_id is NOT NULL and ON DELETE RESTRICT, so the exercise always exists
// (it may be soft-deleted, which is exactly what exercise.isActive reports).
export async function listTemplateExercisesWithExercise(
  userId: string,
  templateId: string,
): Promise<TemplateExerciseWithExerciseRow[]> {
  return db
    .select({
      id: workoutTemplateExercises.id,
      workoutTemplateId: workoutTemplateExercises.workoutTemplateId,
      exerciseId: workoutTemplateExercises.exerciseId,
      userId: workoutTemplateExercises.userId,
      targetSets: workoutTemplateExercises.targetSets,
      targetRepsMin: workoutTemplateExercises.targetRepsMin,
      targetRepsMax: workoutTemplateExercises.targetRepsMax,
      notes: workoutTemplateExercises.notes,
      position: workoutTemplateExercises.position,
      createdAt: workoutTemplateExercises.createdAt,
      updatedAt: workoutTemplateExercises.updatedAt,
      exercise: {
        id: exercises.id,
        name: exercises.name,
        category: exercises.category,
        isActive: exercises.isActive,
      },
    })
    .from(workoutTemplateExercises)
    .innerJoin(exercises, eq(exercises.id, workoutTemplateExercises.exerciseId))
    .where(
      and(
        eq(workoutTemplateExercises.workoutTemplateId, templateId),
        eq(workoutTemplateExercises.userId, userId),
      ),
    )
    .orderBy(workoutTemplateExercises.position);
}

// Next append position within a template: one past the current max, or 0.
export async function getNextTemplateExercisePosition(templateId: string): Promise<number> {
  const [row] = await db
    .select({ next: sql<number>`coalesce(max(${workoutTemplateExercises.position}) + 1, 0)` })
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.workoutTemplateId, templateId));
  return row?.next ?? 0;
}

export async function createTemplateExercise(data: {
  workoutTemplateId: string;
  exerciseId: string;
  userId: string;
  targetSets?: number | null | undefined;
  targetRepsMin?: number | null | undefined;
  targetRepsMax?: number | null | undefined;
  notes?: string | null | undefined;
  position: number;
}): Promise<WorkoutTemplateExercise> {
  const [row] = await db.insert(workoutTemplateExercises).values(data).returning();
  if (!row) {
    throw new Error('Template exercise insert returned no row');
  }
  return row;
}

export async function updateTemplateExercise(
  userId: string,
  id: string,
  data: TemplateExerciseUpdate,
): Promise<WorkoutTemplateExercise | undefined> {
  const [row] = await db
    .update(workoutTemplateExercises)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workoutTemplateExercises.id, id), eq(workoutTemplateExercises.userId, userId)))
    .returning();
  return row;
}

// Hard delete (scaffolding, not history).
export async function deleteTemplateExercise(
  userId: string,
  id: string,
): Promise<WorkoutTemplateExercise | undefined> {
  const [row] = await db
    .delete(workoutTemplateExercises)
    .where(and(eq(workoutTemplateExercises.id, id), eq(workoutTemplateExercises.userId, userId)))
    .returning();
  return row;
}

// Renumber a template's exercises to match orderedIds — same two-phase offset
// in a transaction as reorderTemplates, dodging the unique(template, position).
export async function reorderTemplateExercises(
  userId: string,
  templateId: string,
  orderedIds: string[],
): Promise<WorkoutTemplateExercise[]> {
  return db.transaction(async (tx) => {
    await tx
      .update(workoutTemplateExercises)
      .set({
        position: sql`${workoutTemplateExercises.position} + ${REORDER_OFFSET}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workoutTemplateExercises.workoutTemplateId, templateId),
          eq(workoutTemplateExercises.userId, userId),
        ),
      );

    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(workoutTemplateExercises)
        .set({ position: index, updatedAt: new Date() })
        .where(
          and(
            eq(workoutTemplateExercises.id, id),
            eq(workoutTemplateExercises.workoutTemplateId, templateId),
            eq(workoutTemplateExercises.userId, userId),
          ),
        );
    }

    return tx
      .select()
      .from(workoutTemplateExercises)
      .where(
        and(
          eq(workoutTemplateExercises.workoutTemplateId, templateId),
          eq(workoutTemplateExercises.userId, userId),
        ),
      )
      .orderBy(workoutTemplateExercises.position);
  });
}
