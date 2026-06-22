import { sql } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// Closed set of exercise categories — drives picker grouping and per-category
// filters. Mirrored as EXERCISE_CATEGORIES in @gym-bro/shared.
export const exerciseCategoryEnum = pgEnum('exercise_category', [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Cardio',
  'Other',
]);

// Per-user exercise dictionary. Starts empty (nothing seeded). Soft-deleted via
// is_active rather than removed, so historical workout sessions (Stage 6) keep
// referencing a stable exercise_id.
export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: exerciseCategoryEnum('category').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // No two active exercises with the same name (case-insensitive) per user;
    // soft-deleting frees the name for reuse. Same lower() trick as users.email.
    uniqueIndex('exercises_user_name_active_unique')
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.isActive}`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
