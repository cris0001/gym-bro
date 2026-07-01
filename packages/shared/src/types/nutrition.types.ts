import type { z } from 'zod';

import type { FOOD_LOG_UNITS, MEAL_TYPES } from '../constants/nutrition.constants';
import type {
  createFoodLogSchema,
  createFoodSchema,
  createRecipeSchema,
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

// A food's macros are per 100g. servingGrams (when set) is the weight of one serving,
// so the food can be logged by serving as well as by grams.
export interface Food extends MacroTotals {
  id: string;
  userId: string;
  name: string;
  servingGrams: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
// returned (a soft-deleted food/recipe can't be re-logged).
export interface RecentDiaryItem {
  type: 'food' | 'recipe';
  id: string;
  name: string;
}
