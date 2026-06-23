import { and, eq, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { exercises, type Exercise } from '../../db/schema/exercises';
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
