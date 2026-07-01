import { and, asc, count, desc, eq, gte, ilike, inArray, max, sql } from 'drizzle-orm';

import type { FoodLogUnit, MealType } from '@gym-bro/shared';

import { db } from '../../db/client';
import { foodLog } from '../../db/schema/food-log';
import { foods } from '../../db/schema/foods';
import { nutritionTargets } from '../../db/schema/nutrition-targets';
import { recipeIngredients } from '../../db/schema/recipe-ingredients';
import { recipes } from '../../db/schema/recipes';

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

// --- Recipes ---

// A recipe with its whole-recipe macro totals, aggregated in SQL from its
// ingredients (each food's per-100g macros scaled by amount_grams/100). LEFT JOIN
// + coalesce so a recipe with no ingredients still appears with zero totals. The
// service derives per-serving from these + servings.
export interface RecipeWithTotalsRow {
  id: string;
  userId: string;
  name: string;
  servings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  total: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  totalGrams: number;
}

export async function listRecipesWithTotals(userId: string): Promise<RecipeWithTotalsRow[]> {
  const rows = await db
    .select({
      id: recipes.id,
      userId: recipes.userId,
      name: recipes.name,
      servings: recipes.servings,
      isActive: recipes.isActive,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
      kcal: sql<string>`coalesce(sum(${foods.kcal} * ${recipeIngredients.amountGrams} / 100), 0)`,
      proteinG: sql<string>`coalesce(sum(${foods.proteinG} * ${recipeIngredients.amountGrams} / 100), 0)`,
      carbsG: sql<string>`coalesce(sum(${foods.carbsG} * ${recipeIngredients.amountGrams} / 100), 0)`,
      fatG: sql<string>`coalesce(sum(${foods.fatG} * ${recipeIngredients.amountGrams} / 100), 0)`,
      totalGrams: sql<string>`coalesce(sum(${recipeIngredients.amountGrams}), 0)`,
    })
    .from(recipes)
    .leftJoin(recipeIngredients, eq(recipeIngredients.recipeId, recipes.id))
    .leftJoin(foods, eq(recipeIngredients.foodId, foods.id))
    .where(and(eq(recipes.userId, userId), eq(recipes.isActive, true)))
    .groupBy(recipes.id)
    .orderBy(asc(sql`lower(${recipes.name})`));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.name,
    servings: row.servings,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    total: {
      kcal: Number(row.kcal),
      proteinG: Number(row.proteinG),
      carbsG: Number(row.carbsG),
      fatG: Number(row.fatG),
    },
    totalGrams: Number(row.totalGrams),
  }));
}

export async function findRecipeById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId), eq(recipes.isActive, true)))
    .limit(1);
  return row;
}

// A recipe's ingredient lines, ordered, each with its food's name and per-100g
// macros (coerced to numbers) so the service can scale them to amount_grams.
export interface RecipeIngredientWithFoodRow {
  id: string;
  foodId: string;
  foodName: string;
  amountGrams: number;
  position: number;
  per100g: { kcal: number; proteinG: number; carbsG: number; fatG: number };
}

export async function listRecipeIngredientsWithFood(
  userId: string,
  recipeId: string,
): Promise<RecipeIngredientWithFoodRow[]> {
  const rows = await db
    .select({
      id: recipeIngredients.id,
      foodId: recipeIngredients.foodId,
      foodName: foods.name,
      amountGrams: recipeIngredients.amountGrams,
      position: recipeIngredients.position,
      kcal: foods.kcal,
      proteinG: foods.proteinG,
      carbsG: foods.carbsG,
      fatG: foods.fatG,
    })
    .from(recipeIngredients)
    .innerJoin(foods, eq(recipeIngredients.foodId, foods.id))
    .where(and(eq(recipeIngredients.recipeId, recipeId), eq(recipeIngredients.userId, userId)))
    .orderBy(asc(recipeIngredients.position));

  return rows.map((row) => ({
    id: row.id,
    foodId: row.foodId,
    foodName: row.foodName,
    amountGrams: Number(row.amountGrams),
    position: row.position,
    per100g: {
      kcal: Number(row.kcal),
      proteinG: Number(row.proteinG),
      carbsG: Number(row.carbsG),
      fatG: Number(row.fatG),
    },
  }));
}

interface RecipeInput {
  userId: string;
  name: string;
  servings: number;
  ingredients: { foodId: string; amountGrams: number }[];
}

// Insert a recipe + its ordered ingredient lines in one transaction. Position
// comes from array index. Returns the recipe row (the service composes the detail).
export async function createRecipe(data: RecipeInput) {
  return db.transaction(async (tx) => {
    const [recipe] = await tx
      .insert(recipes)
      .values({ userId: data.userId, name: data.name, servings: data.servings })
      .returning();
    if (!recipe) {
      throw new Error('Recipe insert returned no row');
    }
    await tx.insert(recipeIngredients).values(
      data.ingredients.map((ingredient, position) => ({
        recipeId: recipe.id,
        userId: data.userId,
        foodId: ingredient.foodId,
        amountGrams: ingredient.amountGrams.toString(),
        position,
      })),
    );
    return recipe;
  });
}

// Edit an active recipe: update its metadata and fully replace its ingredient
// lines in one transaction. Returns undefined if the recipe isn't the user's
// (or already soft-deleted).
export async function replaceRecipe(id: string, data: RecipeInput) {
  return db.transaction(async (tx) => {
    const [recipe] = await tx
      .update(recipes)
      .set({ name: data.name, servings: data.servings, updatedAt: new Date() })
      .where(and(eq(recipes.id, id), eq(recipes.userId, data.userId), eq(recipes.isActive, true)))
      .returning();
    if (!recipe) {
      return undefined;
    }
    await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
    await tx.insert(recipeIngredients).values(
      data.ingredients.map((ingredient, position) => ({
        recipeId: id,
        userId: data.userId,
        foodId: ingredient.foodId,
        amountGrams: ingredient.amountGrams.toString(),
        position,
      })),
    );
    return recipe;
  });
}

// Soft delete — the recipe row stays so historical food_log references resolve.
export async function softDeleteRecipe(userId: string, id: string) {
  const [row] = await db
    .update(recipes)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(recipes.id, id), eq(recipes.userId, userId), eq(recipes.isActive, true)))
    .returning();
  return row;
}

// --- Food log ---

// Coerce the snapshot numeric columns to numbers; timestamps stay Date.
function mapFoodLogRow(row: typeof foodLog.$inferSelect) {
  return {
    ...row,
    quantity: Number(row.quantity),
    kcal: Number(row.kcal),
    proteinG: Number(row.proteinG),
    carbsG: Number(row.carbsG),
    fatG: Number(row.fatG),
  };
}

export type FoodLogEntryRow = ReturnType<typeof mapFoodLogRow>;

// The service computes the snapshot (itemName + macros) before calling; the
// repository just persists the row. Exactly one of foodId / recipeId is set.
interface FoodLogInsert {
  userId: string;
  loggedDate: string;
  meal: MealType;
  foodId: string | null;
  recipeId: string | null;
  itemName: string;
  unit: FoodLogUnit;
  quantity: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export async function createFoodLogEntry(data: FoodLogInsert): Promise<FoodLogEntryRow> {
  const [row] = await db
    .insert(foodLog)
    .values({
      userId: data.userId,
      loggedDate: data.loggedDate,
      meal: data.meal,
      foodId: data.foodId,
      recipeId: data.recipeId,
      itemName: data.itemName,
      unit: data.unit,
      quantity: data.quantity.toString(),
      kcal: data.kcal.toString(),
      proteinG: data.proteinG.toString(),
      carbsG: data.carbsG.toString(),
      fatG: data.fatG.toString(),
    })
    .returning();
  if (!row) {
    throw new Error('Food log insert returned no row');
  }
  return mapFoodLogRow(row);
}

// A day's entries in log order.
export async function listFoodLogByDate(userId: string, date: string): Promise<FoodLogEntryRow[]> {
  const rows = await db
    .select()
    .from(foodLog)
    .where(and(eq(foodLog.userId, userId), eq(foodLog.loggedDate, date)))
    .orderBy(asc(foodLog.createdAt));
  return rows.map(mapFoodLogRow);
}

export async function findFoodLogEntryById(
  userId: string,
  id: string,
): Promise<FoodLogEntryRow | undefined> {
  const [row] = await db
    .select()
    .from(foodLog)
    .where(and(eq(foodLog.id, id), eq(foodLog.userId, userId)))
    .limit(1);
  return row ? mapFoodLogRow(row) : undefined;
}

// A recently-logged source for a meal with how often and how recently it was used
// (for frequency ranking). Counts come back as numbers; lastDate is a date string.
export interface RecentDiaryRow {
  type: 'food' | 'recipe';
  id: string;
  name: string;
  count: number;
  lastDate: string;
}

// Distinct active foods and recipes logged for `meal` on/after `sinceDate`, each
// with its use count and most recent day. Only active sources are returned (a
// soft-deleted one can't be re-logged). The service merges, ranks, and caps.
export async function findRecentDiaryRows(
  userId: string,
  meal: MealType,
  sinceDate: string,
): Promise<RecentDiaryRow[]> {
  // The shared filters; the inner join already restricts each query to food vs
  // recipe entries, so no null-check on the polymorphic columns is needed.
  const inWindow = and(
    eq(foodLog.userId, userId),
    eq(foodLog.meal, meal),
    gte(foodLog.loggedDate, sinceDate),
  );

  const foodRows = await db
    .select({
      id: foods.id,
      name: foods.name,
      count: count(),
      lastDate: max(foodLog.loggedDate),
    })
    .from(foodLog)
    .innerJoin(foods, eq(foodLog.foodId, foods.id))
    .where(and(inWindow, eq(foods.isActive, true)))
    .groupBy(foods.id, foods.name);

  const recipeRows = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      count: count(),
      lastDate: max(foodLog.loggedDate),
    })
    .from(foodLog)
    .innerJoin(recipes, eq(foodLog.recipeId, recipes.id))
    .where(and(inWindow, eq(recipes.isActive, true)))
    .groupBy(recipes.id, recipes.name);

  return [
    ...foodRows.map((row) => ({
      type: 'food' as const,
      id: row.id,
      name: row.name,
      count: Number(row.count),
      lastDate: row.lastDate ?? sinceDate,
    })),
    ...recipeRows.map((row) => ({
      type: 'recipe' as const,
      id: row.id,
      name: row.name,
      count: Number(row.count),
      lastDate: row.lastDate ?? sinceDate,
    })),
  ];
}

// Re-snapshot + optionally move the entry to another day. The source reference is
// left unchanged. loggedDate is only set when provided.
interface FoodLogUpdate {
  quantity: number;
  loggedDate?: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export async function updateFoodLogEntry(
  userId: string,
  id: string,
  data: FoodLogUpdate,
): Promise<FoodLogEntryRow | undefined> {
  const [row] = await db
    .update(foodLog)
    .set({
      quantity: data.quantity.toString(),
      kcal: data.kcal.toString(),
      proteinG: data.proteinG.toString(),
      carbsG: data.carbsG.toString(),
      fatG: data.fatG.toString(),
      updatedAt: new Date(),
      ...(data.loggedDate !== undefined ? { loggedDate: data.loggedDate } : {}),
    })
    .where(and(eq(foodLog.id, id), eq(foodLog.userId, userId)))
    .returning();
  return row ? mapFoodLogRow(row) : undefined;
}

// Hard delete — a diary entry is leaf data and fully self-contained (snapshotted).
export async function deleteFoodLogEntry(
  userId: string,
  id: string,
): Promise<FoodLogEntryRow | undefined> {
  const [row] = await db
    .delete(foodLog)
    .where(and(eq(foodLog.id, id), eq(foodLog.userId, userId)))
    .returning();
  return row ? mapFoodLogRow(row) : undefined;
}

// --- Nutrition targets ---

function mapTargetRow(row: typeof nutritionTargets.$inferSelect) {
  return {
    ...row,
    kcal: Number(row.kcal),
    proteinG: Number(row.proteinG),
    carbsG: Number(row.carbsG),
    fatG: Number(row.fatG),
  };
}

export type NutritionTargetRow = ReturnType<typeof mapTargetRow>;

interface TargetInput {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// The current target = the most recent effective date.
export async function findCurrentTarget(userId: string): Promise<NutritionTargetRow | undefined> {
  const [row] = await db
    .select()
    .from(nutritionTargets)
    .where(eq(nutritionTargets.userId, userId))
    .orderBy(desc(nutritionTargets.effectiveDate))
    .limit(1);
  return row ? mapTargetRow(row) : undefined;
}

// Full history, oldest first (for the targets-over-time chart).
export async function listTargets(userId: string): Promise<NutritionTargetRow[]> {
  const rows = await db
    .select()
    .from(nutritionTargets)
    .where(eq(nutritionTargets.userId, userId))
    .orderBy(asc(nutritionTargets.effectiveDate));
  return rows.map(mapTargetRow);
}

// Set the target effective on `date` (today for a normal change, or a past date to
// back-fill history). Re-saving the same date updates that row instead of stacking a
// duplicate, via the (user_id, effective_date) unique index — other dates stay as
// history.
export async function upsertTargetOnDate(
  userId: string,
  date: string,
  data: TargetInput,
): Promise<NutritionTargetRow> {
  const values = {
    kcal: data.kcal.toString(),
    proteinG: data.proteinG.toString(),
    carbsG: data.carbsG.toString(),
    fatG: data.fatG.toString(),
  };
  const [row] = await db
    .insert(nutritionTargets)
    .values({ userId, effectiveDate: date, ...values })
    .onConflictDoUpdate({
      target: [nutritionTargets.userId, nutritionTargets.effectiveDate],
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
  if (!row) {
    throw new Error('Nutrition target upsert returned no row');
  }
  return mapTargetRow(row);
}
