import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { exercises } from './exercises';
import { users } from './users';
import { workoutTemplates } from './workout-templates';

// Join table: the exercises a template prescribes, in order, with target
// sets/reps. Scaffolding for future sessions (not history), so it's hard-deleted
// with its template. exercise_id uses ON DELETE RESTRICT so an exercise can't be
// hard-deleted while a template references it (exercises are soft-deleted).
export const workoutTemplateExercises = pgTable(
  'workout_template_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutTemplateId: uuid('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    // Denormalized owner so rows can be scoped/authorized without joining up.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetSets: integer('target_sets'),
    // Rep target as a range: max null (or equal to min) means a fixed target.
    targetRepsMin: integer('target_reps_min'),
    targetRepsMax: integer('target_reps_max'),
    notes: text('notes'),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deterministic ordering within a template; reorder = renumber in a txn.
    uniqueIndex('wte_template_position_unique').on(table.workoutTemplateId, table.position),
    // One row per exercise per template.
    uniqueIndex('wte_template_exercise_unique').on(table.workoutTemplateId, table.exerciseId),
    check('wte_target_sets_positive', sql`${table.targetSets} IS NULL OR ${table.targetSets} > 0`),
    check(
      'wte_reps_range_valid',
      sql`${table.targetRepsMax} IS NULL OR ${table.targetRepsMin} IS NULL OR ${table.targetRepsMax} >= ${table.targetRepsMin}`,
    ),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type NewWorkoutTemplateExercise = typeof workoutTemplateExercises.$inferInsert;
