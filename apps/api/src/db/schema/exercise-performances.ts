import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { exercises } from './exercises';
import { users } from './users';
import { workoutSessions } from './workout-sessions';

// One exercise performed within a strength session, in order. Keeps the swap
// pair: original_exercise_id is what was prescribed, actual_exercise_id is what
// was actually done (equal when not swapped, and for ad-hoc strength). Both use
// ON DELETE RESTRICT because exercises are soft-deleted (is_active), never hard-
// deleted while referenced — so history always resolves to a real exercise row.
export const exercisePerformances = pgTable(
  'exercise_performances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutSessionId: uuid('workout_session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    // Denormalized owner so rows can be scoped/authorized without joining up.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    originalExerciseId: uuid('original_exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    actualExerciseId: uuid('actual_exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    position: integer('position').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deterministic ordering within a session; reorder = renumber in a txn.
    uniqueIndex('exercise_performances_session_position_unique').on(
      table.workoutSessionId,
      table.position,
    ),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type ExercisePerformance = typeof exercisePerformances.$inferSelect;
export type NewExercisePerformance = typeof exercisePerformances.$inferInsert;
