import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { foods } from './foods';
import { recipes } from './recipes';
import { users } from './users';

// One food in a recipe, in order, with a gram amount. ON DELETE CASCADE from the
// recipe (its lines die with it). food_id is ON DELETE RESTRICT because foods are
// soft-deleted, never hard-removed while referenced, so the macros always
// resolve. Denormalized user_id so rows scope/authorize without joining up (same
// as sets). Duplicate foods on separate lines are allowed (no recipe_id+food_id
// uniqueness) — a user may legitimately list an ingredient twice.
export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    foodId: uuid('food_id')
      .notNull()
      .references(() => foods.id, { onDelete: 'restrict' }),
    // Grams of this food in the recipe. numeric(7,2) allows large amounts (to
    // 99999.99 g) with fractional precision.
    amountGrams: numeric('amount_grams', { precision: 7, scale: 2 }).notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deterministic ingredient order within a recipe; reorder = renumber in a txn
    // (same pattern as exercise_performances).
    uniqueIndex('recipe_ingredients_recipe_position_unique').on(table.recipeId, table.position),
    check('recipe_ingredients_amount_positive', sql`${table.amountGrams} > 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;
