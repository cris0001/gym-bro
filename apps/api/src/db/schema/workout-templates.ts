import { sql } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { trainingPlans } from './training-plans';
import { users } from './users';

// A day within a plan (e.g. "Push", "Pull", "Legs"). Ordered within its plan by
// an integer position. Hard-deleted — deleting a plan cascades to its templates,
// and a template's deletion cascades to its template-exercise rows.
export const workoutTemplates = pgTable(
  'workout_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    trainingPlanId: uuid('training_plan_id')
      .notNull()
      .references(() => trainingPlans.id, { onDelete: 'cascade' }),
    // Denormalized owner so rows can be scoped/authorized without joining up to
    // the plan.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deterministic ordering of days within a plan; reorder = renumber in a txn.
    uniqueIndex('workout_templates_plan_position_unique').on(table.trainingPlanId, table.position),
    // No two days with the same name (case-insensitive) within a plan.
    uniqueIndex('workout_templates_plan_name_unique').on(
      table.trainingPlanId,
      sql`lower(${table.name})`,
    ),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;
