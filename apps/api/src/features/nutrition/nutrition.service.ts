import type {
  CreateFoodInput,
  CreateFoodLogInput,
  CreateRecipeInput,
  FoodLogUnit,
  MealType,
  OffDraft,
  SetNutritionTargetInput,
  UpdateFoodInput,
  UpdateFoodLogInput,
  UpdateRecipeInput,
} from '@gym-bro/shared';

import { divideMacros, multiplyMacros, scaleMacros, sumMacros } from '@gym-bro/shared';

import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import * as nutritionRepository from './nutrition.repository';
import { fetchOffProduct, type OffProductData } from './off-client';

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
  // A barcode-backed food goes through the catalog + pantry flow; a plain custom food
  // (no ean) is inserted as before.
  if (input.ean !== undefined) {
    return saveScannedFood(userId, input.ean, input);
  }
  try {
    return await nutritionRepository.createFood(userId, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A food with this name already exists');
    }
    throw error;
  }
}

// Ensure the shared global exists (created from the confirmed data on first scan), then
// add or revive the user's pantry copy linked to it. Idempotent — re-adding a global
// you already have returns the existing pantry entry.
async function saveScannedFood(userId: string, ean: string, input: CreateFoodInput) {
  const global =
    (await nutritionRepository.findGlobalByEan(ean)) ??
    (await nutritionRepository.createGlobalProduct({
      ean,
      name: input.name,
      brand: input.brand,
      kcal: input.kcal,
      proteinG: input.proteinG,
      carbsG: input.carbsG,
      fatG: input.fatG,
      servingGrams: input.servingGrams,
      unitGrams: input.unitGrams,
      imageUrl: input.imageUrl,
      firstScannedBy: userId,
    }));

  const existing = await nutritionRepository.findFoodByGlobalId(userId, global.id);
  if (existing) {
    if (existing.isActive) return existing;
    return (await nutritionRepository.reactivateFood(userId, existing.id)) ?? existing;
  }
  return nutritionRepository.createFood(userId, input, global.id);
}

// Barcode lookup: our catalog first (with whether it's already in the user's pantry),
// then OpenFoodFacts (a draft to confirm), else nowhere.
export async function lookupByEan(userId: string, ean: string) {
  const global = await nutritionRepository.findGlobalByEan(ean);
  if (global) {
    const pantry = await nutritionRepository.findFoodByGlobalId(userId, global.id);
    return {
      status: 'found' as const,
      product: toGlobalDto(global),
      inPantry: pantry?.isActive === true,
    };
  }
  const off = await fetchOffProduct(ean);
  if (off) {
    return { status: 'off' as const, draft: toOffDraft(off) };
  }
  return { status: 'not_found' as const, ean };
}

// Public catalog shape — drops the internal offRaw + firstScannedBy.
function toGlobalDto(global: nutritionRepository.GlobalProductRow) {
  return {
    id: global.id,
    ean: global.ean,
    name: global.name,
    brand: global.brand,
    kcal: global.kcal,
    proteinG: global.proteinG,
    carbsG: global.carbsG,
    fatG: global.fatG,
    servingGrams: global.servingGrams,
    unitGrams: global.unitGrams,
    imageUrl: global.imageUrl,
    createdAt: global.createdAt,
    updatedAt: global.updatedAt,
  };
}

function toOffDraft(off: OffProductData): OffDraft {
  return {
    ean: off.ean,
    name: off.name,
    brand: off.brand,
    kcal: off.kcal,
    proteinG: off.proteinG,
    carbsG: off.carbsG,
    fatG: off.fatG,
    servingGrams: off.servingGrams,
    imageUrl: off.imageUrl,
  };
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

// Resolve a recipe's ingredient lines into macros (each food scaled to its amount),
// then sum to whole-recipe totals and divide by servings — the computed detail
// returned by the recipe read/write endpoints.
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
    recipe = await nutritionRepository.createRecipe({ userId, ...input });
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
    recipe = await nutritionRepository.replaceRecipe(id, { userId, ...input });
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

// How many items the quick re-add row shows.
const RECENT_LIMIT = 6;

// The last-used items for a meal, most recently used first (with use count as a
// tiebreaker), across all history so a staple logged a while ago still shows. Capped
// to a short list for one-tap re-adding.
export async function getRecentDiaryItems(userId: string, meal: MealType) {
  const rows = await nutritionRepository.findRecentDiaryRows(userId, meal);
  return rows
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate) || b.count - a.count)
    .slice(0, RECENT_LIMIT)
    .map((row) => ({
      type: row.type,
      id: row.id,
      name: row.name,
      unit: row.unit,
      quantity: row.quantity,
    }));
}

// Compute the snapshot (itemName + macros) for logging a source at a unit+quantity.
// Shared by create and unit-changing edits, so both round-trip identically. The
// source must still be active: a food scales its per-100g macros by grams (or by
// serving/unit weight); a recipe scales its per-serving or per-gram macros. Units
// only make sense for foods.
async function computeLogSnapshot(
  userId: string,
  opts: { foodId: string | null; recipeId: string | null; unit: FoodLogUnit; quantity: number },
): Promise<{ itemName: string; kcal: number; proteinG: number; carbsG: number; fatG: number }> {
  if (opts.foodId !== null) {
    const food = await nutritionRepository.findFoodById(userId, opts.foodId);
    if (!food?.isActive) {
      throw new ValidationError('Food not found');
    }
    let grams = opts.quantity;
    if (opts.unit === 'servings') {
      if (food.servingGrams === null) {
        throw new ValidationError(
          'This food has no serving size, so it can only be logged by grams',
        );
      }
      grams = opts.quantity * food.servingGrams;
    } else if (opts.unit === 'units') {
      if (food.unitGrams === null) {
        throw new ValidationError('This food has no unit size, so it can only be logged by grams');
      }
      grams = opts.quantity * food.unitGrams;
    }
    return { itemName: food.name, ...scaleMacros(food, grams) };
  }

  if (opts.recipeId === null) {
    throw new ValidationError('Log entry has no source');
  }
  const recipe = await nutritionRepository.findRecipeById(userId, opts.recipeId);
  if (!recipe) {
    throw new ValidationError('Recipe not found');
  }
  if (opts.unit === 'units') {
    throw new ValidationError('A recipe can only be logged by servings or grams');
  }
  const detail = await buildRecipeDetail(recipe);
  // Per-serving for a servings log; per-gram (total / total weight) for a grams log.
  const perUnit =
    opts.unit === 'servings' ? detail.perServing : divideMacros(detail.total, detail.totalGrams);
  return { itemName: recipe.name, ...multiplyMacros(perUnit, opts.quantity) };
}

// Create an entry, snapshotting the macros from the referenced source at the logged
// unit+quantity (itemName + unit are snapshotted too).
export async function createFoodLogEntry(userId: string, input: CreateFoodLogInput) {
  const foodId = input.type === 'food' ? input.foodId : null;
  const recipeId = input.type === 'recipe' ? input.recipeId : null;
  const snapshot = await computeLogSnapshot(userId, {
    foodId,
    recipeId,
    unit: input.unit,
    quantity: input.quantity,
  });
  return nutritionRepository.createFoodLogEntry({
    userId,
    loggedDate: input.loggedDate,
    meal: input.meal,
    foodId,
    recipeId,
    itemName: snapshot.itemName,
    unit: input.unit,
    quantity: input.quantity,
    kcal: snapshot.kcal,
    proteinG: snapshot.proteinG,
    carbsG: snapshot.carbsG,
    fatG: snapshot.fatG,
  });
}

// Edit an entry's quantity, unit, and/or day. A same-unit quantity change is a linear
// rescale of the snapshot (no source needed, so it still works when the source was
// soft-deleted). A unit change can't be a linear rescale — grams-per-unit differs —
// so it re-snapshots from the (still-active) source.
export async function updateFoodLogEntry(userId: string, id: string, input: UpdateFoodLogInput) {
  const entry = await nutritionRepository.findFoodLogEntryById(userId, id);
  if (!entry) {
    throw new NotFoundError('Log entry not found');
  }
  const newQuantity = input.quantity ?? entry.quantity;
  const newUnit = input.unit ?? entry.unit;

  let macros: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  if (input.unit !== undefined && input.unit !== entry.unit) {
    const snapshot = await computeLogSnapshot(userId, {
      foodId: entry.foodId,
      recipeId: entry.recipeId,
      unit: newUnit,
      quantity: newQuantity,
    });
    macros = {
      kcal: snapshot.kcal,
      proteinG: snapshot.proteinG,
      carbsG: snapshot.carbsG,
      fatG: snapshot.fatG,
    };
  } else {
    macros = multiplyMacros(entry, newQuantity / entry.quantity);
  }

  const updated = await nutritionRepository.updateFoodLogEntry(userId, id, {
    quantity: newQuantity,
    unit: newUnit,
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

// Set/change a target. No effectiveDate → today's target (a same-day re-save
// replaces today's row); an effectiveDate → back-fill/replace that date's historical
// target. Prior dates always stay as history.
export async function setNutritionTarget(userId: string, input: SetNutritionTargetInput) {
  return nutritionRepository.upsertTargetOnDate(userId, input.effectiveDate ?? todayIso(), input);
}
