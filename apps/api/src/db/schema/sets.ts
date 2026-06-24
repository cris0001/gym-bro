import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { exercisePerformances } from './exercise-performances';
import { users } from './users';

// The logged sets of one exercise performance, in order. All metrics are
// nullable: weight null = bodyweight, and a set may be logged with only some
// fields. Cascade-deleted with its performance (and thus its session).
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    exercisePerformanceId: uuid('exercise_performance_id')
      .notNull()
      .references(() => exercisePerformances.id, { onDelete: 'cascade' }),
    // Denormalized owner so rows can be scoped/authorized without joining up.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    // kg, allows half-plate increments (e.g. 2.50). NULL = bodyweight.
    weight: numeric('weight', { precision: 6, scale: 2 }),
    reps: integer('reps'),
    // Reps in reserve, 0–5.
    rir: smallint('rir'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deterministic set order within a performance; reorder = renumber in a txn.
    uniqueIndex('sets_performance_position_unique').on(table.exercisePerformanceId, table.position),
    // NULL passes each check (fields are optional).
    check('sets_weight_non_negative', sql`${table.weight} >= 0`),
    check('sets_reps_non_negative', sql`${table.reps} >= 0`),
    check('sets_rir_range', sql`${table.rir} between 0 and 5`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutSet = typeof sets.$inferSelect;
export type NewWorkoutSet = typeof sets.$inferInsert;
