import { sql } from 'drizzle-orm';
import { check, date, numeric, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// Historical body metrics — one entry per day max (UNIQUE per date); a same-day
// re-save upserts that row rather than piling up, so the full history charts a
// trend. Every measurement is OPTIONAL: weight + body fat are the primary metrics
// shown prominently; biceps/chest/waist/hip/thigh are advanced (behind "show
// more"). "At least one value present" is enforced in the Zod/service layer, not
// the DB, to keep the schema clean.
export const bodyMeasurements = pgTable(
  'body_measurements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The day this entry is for; the user picks it (defaults to today in the UI).
    measuredDate: date('measured_date').notNull(),
    // Primary metrics. numeric(5,2): up to 999.99; numeric(4,2): 0–100 for body fat.
    weightKg: numeric('weight_kg', { precision: 5, scale: 2 }),
    bodyFatPct: numeric('body_fat_pct', { precision: 4, scale: 2 }),
    // Optional advanced circumference measurements (cm).
    bicepsCm: numeric('biceps_cm', { precision: 5, scale: 2 }),
    chestCm: numeric('chest_cm', { precision: 5, scale: 2 }),
    waistCm: numeric('waist_cm', { precision: 5, scale: 2 }),
    hipCm: numeric('hip_cm', { precision: 5, scale: 2 }),
    thighCm: numeric('thigh_cm', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every same-day upsert (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One entry per date; a same-day change is an ON CONFLICT upsert, so prior
    // dates stay as history. Also covers the user+date history scan.
    uniqueIndex('body_measurements_user_date_unique').on(table.userId, table.measuredDate),
    check('body_measurements_weight_non_negative', sql`${table.weightKg} >= 0`),
    check(
      'body_measurements_body_fat_range',
      sql`${table.bodyFatPct} >= 0 and ${table.bodyFatPct} <= 100`,
    ),
    check('body_measurements_biceps_non_negative', sql`${table.bicepsCm} >= 0`),
    check('body_measurements_chest_non_negative', sql`${table.chestCm} >= 0`),
    check('body_measurements_waist_non_negative', sql`${table.waistCm} >= 0`),
    check('body_measurements_hip_non_negative', sql`${table.hipCm} >= 0`),
    check('body_measurements_thigh_non_negative', sql`${table.thighCm} >= 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type NewBodyMeasurement = typeof bodyMeasurements.$inferInsert;
