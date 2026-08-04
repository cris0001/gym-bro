import type { z } from 'zod';

import type { FOOD_LOG_UNITS, MEAL_TYPES } from '../constants/nutrition.constants';
import type {
  createFoodLogSchema,
  createFoodSchema,
  createRecipeSchema,
  eanParamSchema,
  foodLogDateQuerySchema,
  recentFoodLogQuerySchema,
  recipeIngredientInputSchema,
  setNutritionTargetSchema,
  updateFoodLogSchema,
  updateFoodSchema,
  updateRecipeSchema,
} from '../schemas/nutrition.schema';

// --- Inferred request inputs ---

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
export type RecipeIngredientInput = z.infer<typeof recipeIngredientInputSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type SetNutritionTargetInput = z.infer<typeof setNutritionTargetSchema>;
export type CreateFoodLogInput = z.infer<typeof createFoodLogSchema>;
export type UpdateFoodLogInput = z.infer<typeof updateFoodLogSchema>;
export type FoodLogDateQueryInput = z.infer<typeof foodLogDateQuerySchema>;
export type RecentFoodLogQueryInput = z.infer<typeof recentFoodLogQuerySchema>;
export type EanParamInput = z.infer<typeof eanParamSchema>;

// --- Wire entity shapes (numeric columns coerced to numbers by the service;
// date columns are 'YYYY-MM-DD' strings; timestamps are ISO strings) ---

export type MealType = (typeof MEAL_TYPES)[number];
export type FoodLogUnit = (typeof FOOD_LOG_UNITS)[number];

// The reusable four-number macro shape: per-100g for a food, a daily goal for a
// target, or a snapshotted total for a log entry.
export interface MacroTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// A food in a user's pantry. Macros are per 100g. servingGrams / unitGrams (when set)
// are the weights of one serving / one unit-piece, so the food can be logged by serving
// or by unit as well as by grams. globalProductId links this entry to the shared
// catalog when it came from a scanned barcode (null = a fully custom product); ean /
// brand / imageUrl are copied from that global or entered by the user.
export interface Food extends MacroTotals {
  id: string;
  userId: string;
  globalProductId: string | null;
  name: string;
  ean: string | null;
  brand: string | null;
  servingGrams: number | null;
  unitGrams: number | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// A product from the shared, EAN-keyed catalog (built up as users scan). Macros per
// 100g. Internal fields (offRaw, firstScannedBy) are not exposed — this is the shape
// the barcode lookup returns, for a preview and to seed a pantry copy.
export interface GlobalProduct extends MacroTotals {
  id: string;
  ean: string;
  name: string;
  brand: string | null;
  servingGrams: number | null;
  unitGrams: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// A not-yet-persisted product pulled from OpenFoodFacts, used to prefill the add form
// when a scanned barcode isn't in our catalog yet. Macros are per 100g; any field OFF
// didn't provide is null (the user completes it before saving).
export interface OffDraft {
  ean: string;
  name: string;
  brand: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  servingGrams: number | null;
  imageUrl: string | null;
}

// Result of a barcode lookup: already in our catalog (+ whether it's in the user's
// pantry), found only on OpenFoodFacts (a draft to confirm), or nowhere (blank form,
// ean remembered).
export type EanLookupResult =
  | { status: 'found'; product: GlobalProduct; inPantry: boolean }
  | { status: 'off'; draft: OffDraft }
  | { status: 'not_found'; ean: string };

export interface NutritionTarget extends MacroTotals {
  id: string;
  userId: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

// A diary entry. macros (from MacroTotals) are the snapshotted totals for this
// entry. Exactly one of foodId / recipeId is set; itemName is the snapshot label.
export interface FoodLogEntry extends MacroTotals {
  id: string;
  userId: string;
  loggedDate: string;
  meal: MealType;
  foodId: string | null;
  recipeId: string | null;
  itemName: string;
  unit: FoodLogUnit;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  servings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// One ingredient line resolved with its food's name and the macros that food
// contributes at amountGrams (computed on read).
export interface RecipeIngredientWithFood {
  id: string;
  foodId: string;
  foodName: string;
  amountGrams: number;
  position: number;
  macros: MacroTotals;
}

// Full recipe with its ingredients and computed macro totals (whole recipe and
// per serving). Totals are derived from the ingredients on read — no stored cache.
export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredientWithFood[];
  totalGrams: number;
  total: MacroTotals;
  perServing: MacroTotals;
}

// Lightweight recipe for lists — per-serving macros without the ingredient lines.
export interface RecipeListItem extends Recipe {
  totalGrams: number;
  perServing: MacroTotals;
}

// A single day's diary: the entries plus their summed totals (the current target
// is fetched separately).
export interface DailyFoodLog {
  date: string;
  entries: FoodLogEntry[];
  totals: MacroTotals;
}

// A recently-logged source for a meal, for the quick re-add list. `type`
// discriminates which dictionary `id` points at; only still-active sources are
// returned (a soft-deleted food/recipe can't be re-logged). `unit` + `quantity` are
// the portion last used for this meal, so it can be re-added in one tap.
export interface RecentDiaryItem {
  type: 'food' | 'recipe';
  id: string;
  name: string;
  unit: FoodLogUnit;
  quantity: number;
}
