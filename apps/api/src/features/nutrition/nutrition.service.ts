import type {
  CreateFoodInput,
  CreateFoodLogInput,
  CreateRecipeInput,
  SetNutritionTargetInput,
  UpdateFoodInput,
  UpdateFoodLogInput,
  UpdateRecipeInput,
} from '@gym-bro/shared';

import { divideMacros, multiplyMacros, scaleMacros, sumMacros } from '@gym-bro/shared';

import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import * as nutritionRepository from './nutrition.repository';

// Business logic for the nutrition domain — ownership checks, conflict mapping,
// macro computation. No Drizzle here. Grown per resource, foods first.

function hasPgCode(value: unknown, code: string): boolean {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code;
}

// Postgres unique_violation, mapped to a 409. Drizzle wraps the driver error so
// the pg code lives on the cause; check both levels. (Same check as the other
// feature services; kept local to keep the feature self-contained.)
function isUniqueViolation(error: unknown): boolean {
  if (hasPgCode(error, '23505')) {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'cause' in error) {
    return hasPgCode(error.cause, '23505');
  }
  return false;
}

// --- Foods ---

export async function listFoods(userId: string, search?: string) {
  return nutritionRepository.listFoods(userId, search);
}

export async function createFood(userId: string, input: CreateFoodInput) {
  try {
    return await nutritionRepository.createFood(userId, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A food with this name already exists');
    }
    throw error;
  }
}

export async function updateFood(userId: string, id: string, input: UpdateFoodInput) {
  let food;
  try {
    food = await nutritionRepository.updateFood(userId, id, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A food with this name already exists');
    }
    throw error;
  }
  if (!food) {
    throw new NotFoundError('Food not found');
  }
  return food;
}

export async function deleteFood(userId: string, id: string) {
  const food = await nutritionRepository.softDeleteFood(userId, id);
  if (!food) {
    throw new NotFoundError('Food not found');
  }
  return food;
}

// --- Recipes ---

// Every ingredient must reference an active food the user owns. Validated up
// front so a bad reference is a 400, not an FK error mid-transaction.
async function assertIngredientFoodsExist(
  userId: string,
  ingredients: { foodId: string }[],
): Promise<void> {
  const ids = [...new Set(ingredients.map((i) => i.foodId))];
  const found = await nutritionRepository.findActiveFoodsByIds(userId, ids);
  if (found.length !== ids.length) {
    throw new ValidationError('One or more ingredients reference a food that does not exist');
  }
}

// Resolve a recipe's ingredient lines into macros (each food scaled to its
// amount), then sum to whole-recipe totals and divide by servings — the computed
// detail returned by the recipe read/write endpoints.
async function buildRecipeDetail(recipe: {
  id: string;
  userId: string;
  name: string;
  servings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const lines = await nutritionRepository.listRecipeIngredientsWithFood(recipe.userId, recipe.id);
  const ingredients = lines.map((line) => ({
    id: line.id,
    foodId: line.foodId,
    foodName: line.foodName,
    amountGrams: line.amountGrams,
    position: line.position,
    macros: scaleMacros(line.per100g, line.amountGrams),
  }));
  const total = sumMacros(ingredients.map((i) => i.macros));
  const totalGrams = ingredients.reduce((sum, i) => sum + i.amountGrams, 0);
  return {
    ...recipe,
    ingredients,
    totalGrams,
    total,
    perServing: divideMacros(total, recipe.servings),
  };
}

export async function listRecipes(userId: string) {
  const rows = await nutritionRepository.listRecipesWithTotals(userId);
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.name,
    servings: row.servings,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    totalGrams: row.totalGrams,
    perServing: divideMacros(row.total, row.servings),
  }));
}

export async function getRecipe(userId: string, id: string) {
  const recipe = await nutritionRepository.findRecipeById(userId, id);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }
  return buildRecipeDetail(recipe);
}

export async function createRecipe(userId: string, input: CreateRecipeInput) {
  await assertIngredientFoodsExist(userId, input.ingredients);
  let recipe;
  try {
    recipe = await nutritionRepository.createRecipe({
      userId,
      name: input.name,
      servings: input.servings,
      ingredients: input.ingredients,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A recipe with this name already exists');
    }
    throw error;
  }
  return buildRecipeDetail(recipe);
}

export async function updateRecipe(userId: string, id: string, input: UpdateRecipeInput) {
  await assertIngredientFoodsExist(userId, input.ingredients);
  let recipe;
  try {
    recipe = await nutritionRepository.replaceRecipe(id, {
      userId,
      name: input.name,
      servings: input.servings,
      ingredients: input.ingredients,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A recipe with this name already exists');
    }
    throw error;
  }
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }
  return buildRecipeDetail(recipe);
}

export async function deleteRecipe(userId: string, id: string) {
  const recipe = await nutritionRepository.softDeleteRecipe(userId, id);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }
  return recipe;
}

// --- Food log ---

// A day's diary: entries plus their summed macro totals.
export async function getDailyFoodLog(userId: string, date: string) {
  const entries = await nutritionRepository.listFoodLogByDate(userId, date);
  return { date, entries, totals: sumMacros(entries) };
}

// Create an entry, snapshotting the macros from the referenced source at the
// logged quantity: a food scales its per-100g macros by grams; a recipe scales
// its per-serving macros by the number of servings. itemName is snapshotted too.
export async function createFoodLogEntry(userId: string, input: CreateFoodLogInput) {
  if (input.type === 'food') {
    const food = await nutritionRepository.findFoodById(userId, input.foodId);
    if (!food?.isActive) {
      throw new ValidationError('Food not found');
    }
    return nutritionRepository.createFoodLogEntry({
      userId,
      loggedDate: input.loggedDate,
      foodId: input.foodId,
      recipeId: null,
      itemName: food.name,
      quantity: input.quantity,
      ...scaleMacros(food, input.quantity),
    });
  }

  const recipe = await nutritionRepository.findRecipeById(userId, input.recipeId);
  if (!recipe) {
    throw new ValidationError('Recipe not found');
  }
  const detail = await buildRecipeDetail(recipe);
  return nutritionRepository.createFoodLogEntry({
    userId,
    loggedDate: input.loggedDate,
    foodId: null,
    recipeId: input.recipeId,
    itemName: recipe.name,
    quantity: input.quantity,
    ...multiplyMacros(detail.perServing, input.quantity),
  });
}

// Edit an entry's quantity and/or day. The snapshot is linear in quantity, so a
// quantity change rescales the stored macros by the ratio — no need to refetch
// the (possibly soft-deleted) source.
export async function updateFoodLogEntry(userId: string, id: string, input: UpdateFoodLogInput) {
  const entry = await nutritionRepository.findFoodLogEntryById(userId, id);
  if (!entry) {
    throw new NotFoundError('Log entry not found');
  }
  const newQuantity = input.quantity ?? entry.quantity;
  const macros = multiplyMacros(entry, newQuantity / entry.quantity);
  const updated = await nutritionRepository.updateFoodLogEntry(userId, id, {
    quantity: newQuantity,
    ...macros,
    ...(input.loggedDate !== undefined ? { loggedDate: input.loggedDate } : {}),
  });
  if (!updated) {
    throw new NotFoundError('Log entry not found');
  }
  return updated;
}

export async function deleteFoodLogEntry(userId: string, id: string) {
  const entry = await nutritionRepository.deleteFoodLogEntry(userId, id);
  if (!entry) {
    throw new NotFoundError('Log entry not found');
  }
  return entry;
}

// --- Nutrition targets ---

// Today's date as 'YYYY-MM-DD' (UTC). The effective date is server-stamped; for a
// single-user app a UTC day boundary is acceptable.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// The current target, or null if the user has never set one.
export async function getCurrentTarget(userId: string) {
  return (await nutritionRepository.findCurrentTarget(userId)) ?? null;
}

export async function listNutritionTargets(userId: string) {
  return nutritionRepository.listTargets(userId);
}

// Set/change today's target — a same-day re-save replaces today's row.
export async function setNutritionTarget(userId: string, input: SetNutritionTargetInput) {
  return nutritionRepository.upsertTodayTarget(userId, todayIso(), input);
}
