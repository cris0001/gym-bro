import { sql } from 'drizzle-orm';
import {
  check,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users';

// Shared, crowd-sourced product catalog keyed by EAN barcode. Starts empty; a row is
// created the first time any user scans a barcode we don't have yet — fetched from
// OpenFoodFacts, or completed by the user when OFF lacks the data. Read-only to users:
// nobody edits a global. To change values you fork it into your own `foods` (pantry)
// row. Macros are per 100g, same convention as `foods`.
export const globalProducts = pgTable(
  'global_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // The barcode — the dedup key. One global per code (unique index below).
    ean: text('ean').notNull(),
    name: text('name').notNull(),
    // Brand/producer (OFF's `brands`), for easy identification. Optional.
    brand: text('brand'),
    // All per 100g. numeric(6,2) matches foods.
    kcal: numeric('kcal', { precision: 6, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 6, scale: 2 }).notNull(),
    carbsG: numeric('carbs_g', { precision: 6, scale: 2 }).notNull(),
    fatG: numeric('fat_g', { precision: 6, scale: 2 }).notNull(),
    // Weight of one serving / one unit (grams) when OFF provides them; null otherwise.
    servingGrams: numeric('serving_grams', { precision: 7, scale: 2 }),
    unitGrams: numeric('unit_grams', { precision: 7, scale: 2 }),
    // OFF-hosted image URL — we store the URL, not the bytes.
    imageUrl: text('image_url'),
    // Raw OpenFoodFacts payload, kept to backfill new columns later (same idea as
    // strava_sessions.raw).
    offRaw: jsonb('off_raw'),
    // Who first contributed this product. SET NULL on user delete so the shared
    // catalog survives.
    firstScannedBy: uuid('first_scanned_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('global_products_ean_unique').on(table.ean),
    check('global_products_kcal_non_negative', sql`${table.kcal} >= 0`),
    check('global_products_protein_non_negative', sql`${table.proteinG} >= 0`),
    check('global_products_carbs_non_negative', sql`${table.carbsG} >= 0`),
    check('global_products_fat_non_negative', sql`${table.fatG} >= 0`),
    check('global_products_serving_grams_positive', sql`${table.servingGrams} > 0`),
    check('global_products_unit_grams_positive', sql`${table.unitGrams} > 0`),
  ],
);

// Inferred row types for repository code (internal — the API contract is the Zod
// schemas in packages/shared).
export type GlobalProduct = typeof globalProducts.$inferSelect;
export type NewGlobalProduct = typeof globalProducts.$inferInsert;
