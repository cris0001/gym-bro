import { sql } from 'drizzle-orm';
import { check, date, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { foods } from './foods';
import { recipes } from './recipes';
import { users } from './users';

// A daily diary entry referencing EITHER a food or a recipe (exactly one), with
// macros SNAPSHOTTED at log time so editing/renaming/soft-deleting the source
// never rewrites eating history. The unit is implied by the reference: a food
// entry's quantity is grams, a recipe entry's is servings. Daily totals are a
// join-free SUM over the snapshot columns.
export const foodLog = pgTable(
  'food_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    loggedDate: date('logged_date').notNull(),
    // Exactly one of foodId / recipeId is set (CHECK below). RESTRICT: foods and
    // recipes are soft-deleted, never hard-removed while referenced.
    foodId: uuid('food_id').references(() => foods.id, { onDelete: 'restrict' }),
    recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'restrict' }),
    // Snapshot of the source name at log time, so the row reads correctly after a
    // rename or soft-delete. The FK is kept only for "jump to source" linking.
    itemName: text('item_name').notNull(),
    // Grams (food) or servings (recipe), per which reference is set.
    quantity: numeric('quantity', { precision: 7, scale: 2 }).notNull(),
    // Snapshot totals for this entry's quantity, computed in the service.
    kcal: numeric('kcal', { precision: 7, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 7, scale: 2 }).notNull(),
    carbsG: numeric('carbs_g', { precision: 7, scale: 2 }).notNull(),
    fatG: numeric('fat_g', { precision: 7, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // The diary scans by user + day (same shape as workout_sessions_user_date_idx).
    index('food_log_user_date_idx').on(table.userId, table.loggedDate),
    // Polymorphic xor: exactly one of food / recipe is referenced.
    check(
      'food_log_one_reference',
      sql`(${table.foodId} is not null)::int + (${table.recipeId} is not null)::int = 1`,
    ),
    check('food_log_quantity_positive', sql`${table.quantity} > 0`),
    check('food_log_kcal_non_negative', sql`${table.kcal} >= 0`),
    check('food_log_protein_non_negative', sql`${table.proteinG} >= 0`),
    check('food_log_carbs_non_negative', sql`${table.carbsG} >= 0`),
    check('food_log_fat_non_negative', sql`${table.fatG} >= 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type FoodLogEntry = typeof foodLog.$inferSelect;
export type NewFoodLogEntry = typeof foodLog.$inferInsert;
