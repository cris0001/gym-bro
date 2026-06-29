import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users';

// Per-user food dictionary. Starts empty (nothing seeded). Macros are stored per
// 100g; kcal is the label value as entered, not derived from 4/4/9 (rounding,
// fiber, and alcohol make the label differ). Soft-deleted via is_active rather
// than removed, so historical food_log / recipe_ingredients rows keep referencing
// a stable food_id and the name frees up for reuse — same pattern as exercises.
export const foods = pgTable(
  'foods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // All per 100g. numeric(6,2) matches sets.weight precision; allows fractional
    // macros (e.g. 3.60) with headroom to 9999.99.
    kcal: numeric('kcal', { precision: 6, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 6, scale: 2 }).notNull(),
    carbsG: numeric('carbs_g', { precision: 6, scale: 2 }).notNull(),
    fatG: numeric('fat_g', { precision: 6, scale: 2 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // No two active foods with the same name (case-insensitive) per user;
    // soft-deleting frees the name for reuse. Same lower() trick as exercises.
    uniqueIndex('foods_user_name_active_unique')
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.isActive}`),
    check('foods_kcal_non_negative', sql`${table.kcal} >= 0`),
    check('foods_protein_non_negative', sql`${table.proteinG} >= 0`),
    check('foods_carbs_non_negative', sql`${table.carbsG} >= 0`),
    check('foods_fat_non_negative', sql`${table.fatG} >= 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
