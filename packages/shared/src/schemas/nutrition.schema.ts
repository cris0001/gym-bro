import { z } from 'zod';

import { FOOD_LOG_UNITS, MEAL_TYPES } from '../constants/nutrition.constants';

// --- Shared field helpers ---

const itemName = z.string().trim().min(1, 'Name is required').max(100, 'Name is too long');
const meal = z.enum(MEAL_TYPES);
// A per-100g macro or a daily target value: numeric(6,2), non-negative.
const macroValue = z.number().min(0, 'Must be 0 or more').max(9999.99, 'Too large');
// A gram amount or serving quantity: numeric(7,2), strictly positive.
const positiveAmount = z.number().positive('Must be greater than 0').max(99999.99, 'Too large');

// --- Foods (per-100g macros) ---

// Create and edit share the shape — editing a food fully replaces its fields.
// servingGrams / unitGrams are optional and independent: set servingGrams (e.g. "1
// serving = 150 g") to log by serving, and/or unitGrams (e.g. "1 cracker = 9 g") to
// log by unit/piece, in addition to grams.
export const createFoodSchema = z.object({
  name: itemName,
  kcal: macroValue,
  proteinG: macroValue,
  carbsG: macroValue,
  fatG: macroValue,
  servingGrams: positiveAmount.optional(),
  unitGrams: positiveAmount.optional(),
});
export const updateFoodSchema = createFoodSchema;

// --- Recipes ---

// One ingredient line in a recipe: a food plus a gram amount. Position comes from
// array order (assigned server-side).
export const recipeIngredientInputSchema = z.object({
  foodId: z.uuid(),
  amountGrams: positiveAmount,
});

// A recipe is composed of foods (≥1); its macros are computed from the ingredients.
// Create and edit share the shape — editing fully replaces the name, servings, and
// ingredient list. (Prepared/bought products are modelled as foods with a serving
// size, not recipes.)
export const createRecipeSchema = z.object({
  name: itemName,
  servings: z.number().int().positive('Servings must be at least 1').max(1000, 'Too many servings'),
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, 'Add at least one ingredient')
    .max(100, 'Too many ingredients'),
});
export const updateRecipeSchema = createRecipeSchema;

// --- Nutrition targets ---

// Set/change a target. effectiveDate is optional: omitted → stamped "today"
// server-side (the normal "change my current target" case); provided → back-fill a
// historical target on that date. Either way a same-day change upserts that date's
// row. All four macro fields required.
export const setNutritionTargetSchema = z.object({
  effectiveDate: z.iso.date().optional(),
  kcal: macroValue,
  proteinG: macroValue,
  carbsG: macroValue,
  fatG: macroValue,
});

// --- Food log ---

// A diary entry references a food (quantity = grams) or a recipe (quantity =
// servings); the discriminator makes that unambiguous and prevents setting both
// or neither. The macros are computed and snapshotted server-side, so they're not
// in the input.
// A food is always logged by grams (server-set unit); a recipe carries an explicit
// unit so it can be logged by grams OR by servings. `meal` groups the entry.
export const createFoodLogSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('food'),
    foodId: z.uuid(),
    quantity: positiveAmount,
    // Grams by default; 'servings' when the food has a serving size (server checks).
    unit: z.enum(FOOD_LOG_UNITS).default('grams'),
    meal,
    loggedDate: z.iso.date(),
  }),
  z.object({
    type: z.literal('recipe'),
    recipeId: z.uuid(),
    quantity: positiveAmount,
    unit: z.enum(FOOD_LOG_UNITS),
    meal,
    loggedDate: z.iso.date(),
  }),
]);

// Editing an entry changes its quantity, unit, and/or day; the referenced food or
// recipe is fixed at creation (change it by deleting and re-adding). A quantity-only
// change is a linear rescale of the snapshot; changing the unit re-snapshots from the
// (still-active) source.
export const updateFoodLogSchema = z
  .object({
    quantity: positiveAmount.optional(),
    unit: z.enum(FOOD_LOG_UNITS).optional(),
    loggedDate: z.iso.date().optional(),
  })
  .refine((v) => v.quantity !== undefined || v.unit !== undefined || v.loggedDate !== undefined, {
    message: 'Nothing to update',
  });

// A single day's diary fetch.
export const foodLogDateQuerySchema = z.object({
  date: z.iso.date(),
});

// Recently-logged items for one meal, for the quick re-add list.
export const recentFoodLogQuerySchema = z.object({
  meal,
});
