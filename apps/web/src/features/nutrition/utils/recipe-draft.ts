import { multiplyMacros } from '@gym-bro/shared';
import type { MacroTotals, RecipeDetail } from '@gym-bro/shared';

// Local draft model for the recipe builder: each ingredient keeps raw input strings
// (per the numeric-input pattern) and the food's per-100g macros.

export type IngredientUnit = 'grams' | 'servings' | 'units';

export interface IngredientFood {
  id: string;
  name: string;
  per100g: MacroTotals;
  servingGrams: number | null;
  unitGrams: number | null;
  imageUrl: string | null;
}

export interface IngredientDraft {
  key: string;
  food: IngredientFood | null;
  amount: string;
  unit: IngredientUnit;
}

// The food fields the builder needs — satisfied by both a Food (picker) and a scan's
// ResolvedFood.
export interface PickableFood {
  id: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingGrams: number | null;
  unitGrams: number | null;
  // Picker foods have a photo; a scan result may not.
  imageUrl?: string | null;
}

export const UNIT_SHORT: Record<IngredientUnit, string> = {
  grams: 'g',
  servings: 'serv',
  units: 'u',
};

// Grams an ingredient contributes: servings/units resolve via the food's serving/unit
// weight, otherwise the amount is already grams. 0 when the row isn't usable yet.
export function rowGrams(row: IngredientDraft): number {
  const n = Number(row.amount);
  if (!row.food || !Number.isFinite(n) || n <= 0) return 0;
  if (row.unit === 'servings' && row.food.servingGrams) return n * row.food.servingGrams;
  if (row.unit === 'units' && row.food.unitGrams) return n * row.food.unitGrams;
  return n;
}

// A new ingredient from a picked/scanned food, defaulting to 100 g.
export function draftFromFood(food: PickableFood, key: string): IngredientDraft {
  return {
    key,
    food: {
      id: food.id,
      name: food.name,
      per100g: { kcal: food.kcal, proteinG: food.proteinG, carbsG: food.carbsG, fatG: food.fatG },
      servingGrams: food.servingGrams,
      unitGrams: food.unitGrams,
      imageUrl: food.imageUrl ?? null,
    },
    amount: '100',
    unit: 'grams',
  };
}

// Seed the builder from a saved recipe. A line's per-100g macros are reconstructed
// from its stored (amount-scaled) macros, so editing recomputes correctly even when
// the source food was soft-deleted and is no longer in the picker. Stored amounts are
// grams, so lines start in grams; the food's serving/unit weights come with the line,
// so it can still be switched to "serv" / "u".
export function fromDetail(recipe: RecipeDetail): IngredientDraft[] {
  return recipe.ingredients.map((ing) => ({
    key: ing.id,
    food: {
      id: ing.foodId,
      name: ing.foodName,
      per100g: multiplyMacros(ing.macros, 100 / ing.amountGrams),
      servingGrams: ing.servingGrams,
      unitGrams: ing.unitGrams,
      imageUrl: ing.imageUrl,
    },
    amount: String(ing.amountGrams),
    unit: 'grams',
  }));
}
