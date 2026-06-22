import { and, eq, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { exercises, type Exercise } from '../../db/schema/exercises';

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

// Scoped by user; returns the row regardless of is_active so the service can
// distinguish "not yours / missing" (404) from soft-deleted.
export async function findExerciseById(userId: string, id: string): Promise<Exercise | undefined> {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
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
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
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
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
    .returning();
  return exercise;
}
