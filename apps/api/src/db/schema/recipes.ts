import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users';

// How a recipe's macros are defined:
//   - 'ingredients' → composed of recipe_ingredients; totals computed on read.
//   - 'manual'      → a prepared product (e.g. a bought sandwich); its TOTAL macros
//                     are entered by hand and stored below, with no ingredients.
// Mirrored as RECIPE_TYPES in @gym-bro/shared.
export const recipeTypeEnum = pgEnum('recipe_type', ['ingredients', 'manual']);

// Per-user recipe dictionary. Starts empty. Ingredient recipes carry no macro
// columns — totals are computed on read from recipe_ingredients, so they never go
// stale when an ingredient (or its food) changes. Manual recipes store their own
// total macros (the kcal/*_g columns below). servings drives per-serving macros for
// both. Soft-deleted via is_active so historical food_log rows keep referencing a
// stable recipe_id — like foods.
export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: recipeTypeEnum('type').notNull().default('ingredients'),
    // How many servings the recipe yields; per-serving macros = total / servings.
    servings: integer('servings').notNull().default(1),
    // Manual-recipe TOTAL macros (null for ingredient recipes). "All four present
    // for manual, all null for ingredients" is enforced in Zod/service, not the DB.
    kcal: numeric('kcal', { precision: 7, scale: 2 }),
    proteinG: numeric('protein_g', { precision: 7, scale: 2 }),
    carbsG: numeric('carbs_g', { precision: 7, scale: 2 }),
    fatG: numeric('fat_g', { precision: 7, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // No two active recipes with the same name (case-insensitive) per user.
    uniqueIndex('recipes_user_name_active_unique')
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.isActive}`),
    check('recipes_servings_positive', sql`${table.servings} > 0`),
    check('recipes_kcal_non_negative', sql`${table.kcal} >= 0`),
    check('recipes_protein_non_negative', sql`${table.proteinG} >= 0`),
    check('recipes_carbs_non_negative', sql`${table.carbsG} >= 0`),
    check('recipes_fat_non_negative', sql`${table.fatG} >= 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
