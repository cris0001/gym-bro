// Diary meal categories (Fitatu-style), in display order. Mirrors the meal_type
// pgEnum in the food_log table.
export const MEAL_TYPES = ['breakfast', 'second_breakfast', 'lunch', 'snack', 'dinner'] as const;

// The unit a food-log quantity is measured in — grams, servings (for foods with a
// serving size, and for recipes), or units/pieces (for foods with a unit size).
// Mirrors the food_log_unit pgEnum.
export const FOOD_LOG_UNITS = ['grams', 'servings', 'units'] as const;
