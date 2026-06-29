import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { foods } from './foods';
import { recipes } from './recipes';
import { users } from './users';

// Which meal an entry belongs to (Fitatu-style). Mirrored as MEAL_TYPES in shared.
export const mealTypeEnum = pgEnum('meal_type', [
  'breakfast',
  'second_breakfast',
  'lunch',
  'snack',
  'dinner',
]);

// The unit a quantity is expressed in: a food is always grams; a recipe can be
// logged by grams or by servings. Mirrored as FOOD_LOG_UNITS in shared.
export const foodLogUnitEnum = pgEnum('food_log_unit', ['grams', 'servings']);

// A daily diary entry referencing EITHER a food or a recipe (exactly one), with
// macros SNAPSHOTTED at log time so editing/renaming/soft-deleting the source
// never rewrites eating history. The unit is stored explicitly (a recipe may be
// grams or servings). Daily totals are a join-free SUM over the snapshot columns.
export const foodLog = pgTable(
  'food_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    loggedDate: date('logged_date').notNull(),
    // The meal this entry is grouped under. Default backfills pre-existing rows.
    meal: mealTypeEnum('meal').notNull().default('breakfast'),
    // Exactly one of foodId / recipeId is set (CHECK below). RESTRICT: foods and
    // recipes are soft-deleted, never hard-removed while referenced.
    foodId: uuid('food_id').references(() => foods.id, { onDelete: 'restrict' }),
    recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'restrict' }),
    // Snapshot of the source name at log time, so the row reads correctly after a
    // rename or soft-delete. The FK is kept only for "jump to source" linking.
    itemName: text('item_name').notNull(),
    // What `quantity` is measured in (grams for a food; grams or servings for a
    // recipe). Default 'grams' backfills pre-existing food rows; the migration
    // backfills recipe rows to 'servings'.
    unit: foodLogUnitEnum('unit').notNull().default('grams'),
    // Grams or servings of the source, per `unit`.
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
