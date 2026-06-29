import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { foods } from '../../db/schema/foods';

// Drizzle queries for the nutrition domain — plain rows, no business logic. The
// numeric macro columns come back as strings from the driver and are coerced to
// numbers at this boundary (same as sets.weight). Every query is scoped by userId.
// Grown per resource, foods first.

// --- Foods ---

// Coerce the per-100g macro strings to numbers; timestamps stay Date (Hono
// serializes them to ISO strings in the response).
function mapFoodRow(row: typeof foods.$inferSelect) {
  return {
    ...row,
    kcal: Number(row.kcal),
    proteinG: Number(row.proteinG),
    carbsG: Number(row.carbsG),
    fatG: Number(row.fatG),
  };
}

export type FoodRow = ReturnType<typeof mapFoodRow>;

// Caller passes already-validated numbers; stringified for the numeric columns.
interface FoodInput {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// Active foods for the user, case-insensitive alphabetical, optionally filtered
// by a name substring.
export async function listFoods(userId: string, search?: string): Promise<FoodRow[]> {
  const rows = await db
    .select()
    .from(foods)
    .where(
      and(
        eq(foods.userId, userId),
        eq(foods.isActive, true),
        search ? ilike(foods.name, `%${search}%`) : undefined,
      ),
    )
    .orderBy(asc(sql`lower(${foods.name})`));
  return rows.map(mapFoodRow);
}

export async function findFoodById(userId: string, id: string): Promise<FoodRow | undefined> {
  const [row] = await db
    .select()
    .from(foods)
    .where(and(eq(foods.id, id), eq(foods.userId, userId)))
    .limit(1);
  return row ? mapFoodRow(row) : undefined;
}

// Active foods among the given ids — used to validate recipe/log references
// belong to the user and are still live.
export async function findActiveFoodsByIds(userId: string, ids: string[]): Promise<FoodRow[]> {
  if (ids.length === 0) {
    return [];
  }
  const rows = await db
    .select()
    .from(foods)
    .where(and(eq(foods.userId, userId), eq(foods.isActive, true), inArray(foods.id, ids)));
  return rows.map(mapFoodRow);
}

export async function createFood(userId: string, data: FoodInput): Promise<FoodRow> {
  const [row] = await db
    .insert(foods)
    .values({
      userId,
      name: data.name,
      kcal: data.kcal.toString(),
      proteinG: data.proteinG.toString(),
      carbsG: data.carbsG.toString(),
      fatG: data.fatG.toString(),
    })
    .returning();
  if (!row) {
    throw new Error('Food insert returned no row');
  }
  return mapFoodRow(row);
}

// Full-replace edit; only active foods are editable.
export async function updateFood(
  userId: string,
  id: string,
  data: FoodInput,
): Promise<FoodRow | undefined> {
  const [row] = await db
    .update(foods)
    .set({
      name: data.name,
      kcal: data.kcal.toString(),
      proteinG: data.proteinG.toString(),
      carbsG: data.carbsG.toString(),
      fatG: data.fatG.toString(),
      updatedAt: new Date(),
    })
    .where(and(eq(foods.id, id), eq(foods.userId, userId), eq(foods.isActive, true)))
    .returning();
  return row ? mapFoodRow(row) : undefined;
}

// Soft delete — the food row stays so historical food_log / recipe_ingredients
// references keep resolving; the name frees up for reuse.
export async function softDeleteFood(userId: string, id: string): Promise<FoodRow | undefined> {
  const [row] = await db
    .update(foods)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(foods.id, id), eq(foods.userId, userId), eq(foods.isActive, true)))
    .returning();
  return row ? mapFoodRow(row) : undefined;
}
