import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users';

// Per-user recipe dictionary. Starts empty. A recipe is composed of foods — totals
// are computed on read from recipe_ingredients, so they never go stale when an
// ingredient (or its food) changes. servings drives per-serving macros. Soft-deleted
// via is_active so historical food_log rows keep referencing a stable recipe_id —
// like foods. (Prepared/bought products are modelled as foods with a serving size,
// not recipes.)
export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // How many servings the recipe yields; per-serving macros = total / servings.
    servings: integer('servings').notNull().default(1),
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
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
