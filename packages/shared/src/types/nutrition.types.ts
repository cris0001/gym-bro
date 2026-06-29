import type { z } from 'zod';

import type {
  createFoodLogSchema,
  createFoodSchema,
  createRecipeSchema,
  foodLogDateQuerySchema,
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

// --- Wire entity shapes (numeric columns coerced to numbers by the service;
// date columns are 'YYYY-MM-DD' strings; timestamps are ISO strings) ---

// The reusable four-number macro shape: per-100g for a food, a daily goal for a
// target, or a snapshotted total for a log entry.
export interface MacroTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// A food's macros are per 100g.
export interface Food extends MacroTotals {
  id: string;
  userId: string;
  name: string;
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
  foodId: string | null;
  recipeId: string | null;
  itemName: string;
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
