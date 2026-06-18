import { sql } from 'drizzle-orm';
import {
  check,
  date,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Closed set — drives BMR-type calculations later, so the values are fixed.
export const sexEnum = pgEnum('sex', ['male', 'female']);

// Root table: auth credentials + static onboarding profile. Time-series body
// data (weight, body fat, circumferences) lives in a separate historical
// `body_measurements` table (Stage 10), not here.
export const users = pgTable(
  'users',
  {
    // UUID over serial: non-enumerable and portable. gen_random_uuid() is
    // built into Postgres 13+ / Neon.
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    // bcrypt hash, never the raw password.
    passwordHash: text('password_hash').notNull(),
    // Optional profile (onboarding is skippable).
    birthdate: date('birthdate'),
    sex: sexEnum('sex'),
    heightCm: smallint('height_cm'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Case-insensitive uniqueness as a DB-level safety net; the service also
    // lowercases email before insert.
    uniqueIndex('users_email_lower_unique').on(sql`lower(${table.email})`),
    // Reject garbage heights; NULL passes (field is optional).
    check('users_height_cm_range', sql`${table.heightCm} between 50 and 300`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
