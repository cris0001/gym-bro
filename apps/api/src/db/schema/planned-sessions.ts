import { date, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';
import { workoutTemplates } from './workout-templates';

// Lifecycle of a calendar entry. 'completed' is set when its workout is
// finished (a workout_sessions row links back); 'skipped' is an explicit user
// action.
export const plannedStatusEnum = pgEnum('planned_status', ['planned', 'completed', 'skipped']);

// A template scheduled on a date — the calendar layer. Lightweight: the actual
// execution lives in workout_sessions. Cascade-deleted with its template (a
// deleted template just disappears from the calendar; finished workouts persist
// independently in workout_sessions).
export const plannedSessions = pgTable(
  'planned_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    workoutTemplateId: uuid('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    scheduledDate: date('scheduled_date').notNull(),
    status: plannedStatusEnum('status').notNull().default('planned'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One scheduling of a given template per day; different templates may share
    // a day. The (user_id, scheduled_date) prefix also serves calendar range
    // queries, so no separate index is needed.
    uniqueIndex('planned_sessions_user_date_template_unique').on(
      table.userId,
      table.scheduledDate,
      table.workoutTemplateId,
    ),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type PlannedSession = typeof plannedSessions.$inferSelect;
export type NewPlannedSession = typeof plannedSessions.$inferInsert;
