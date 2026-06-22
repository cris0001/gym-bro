import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// Per-user, user-defined labels with a color, attached to workout sessions
// (Stage 6) and shown as colored markers on the calendar. Starts empty (nothing
// seeded). Soft-deleted via is_active so historical sessions keep their tags.
export const workoutTags = pgTable(
  'workout_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // 6-digit hex, e.g. #22c55e. App supplies a default; the picker enforces it.
    color: text('color').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // No two active tags with the same name (case-insensitive) per user;
    // soft-deleting frees the name for reuse. Same lower() trick as users.email.
    uniqueIndex('workout_tags_user_name_active_unique')
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.isActive}`),
    check('workout_tags_color_hex', sql`${table.color} ~* '^#[0-9a-fA-F]{6}$'`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutTag = typeof workoutTags.$inferSelect;
export type NewWorkoutTag = typeof workoutTags.$inferInsert;
