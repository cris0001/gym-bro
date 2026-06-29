import { sql } from 'drizzle-orm';
import { check, date, numeric, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// Historical daily goals — not a single mutable row. Each change writes a row
// stamped with its effective date; the "current" target is the most recent one.
// One row per date (UNIQUE) so a same-day edit upserts rather than piling up, and
// the full history charts how targets evolved. All four fields are required.
export const nutritionTargets = pgTable(
  'nutrition_targets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The day this target took effect; the service stamps "today" on a change.
    effectiveDate: date('effective_date').notNull(),
    // Daily totals. numeric(6,2): kcal/macros to 9999.99, fractional allowed.
    kcal: numeric('kcal', { precision: 6, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 6, scale: 2 }).notNull(),
    carbsG: numeric('carbs_g', { precision: 6, scale: 2 }).notNull(),
    fatG: numeric('fat_g', { precision: 6, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update / same-day upsert.
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One target per date; a same-day change is an ON CONFLICT upsert, so prior
    // dates stay as history.
    uniqueIndex('nutrition_targets_user_date_unique').on(table.userId, table.effectiveDate),
    check('nutrition_targets_kcal_non_negative', sql`${table.kcal} >= 0`),
    check('nutrition_targets_protein_non_negative', sql`${table.proteinG} >= 0`),
    check('nutrition_targets_carbs_non_negative', sql`${table.carbsG} >= 0`),
    check('nutrition_targets_fat_non_negative', sql`${table.fatG} >= 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type NutritionTarget = typeof nutritionTargets.$inferSelect;
export type NewNutritionTarget = typeof nutritionTargets.$inferInsert;
