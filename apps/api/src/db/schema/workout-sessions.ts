import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { plannedSessions } from './planned-sessions';
import { users } from './users';
import { workoutTemplates } from './workout-templates';

// 'strength' = exercises + sets (from a template or ad-hoc); 'activity' = a
// quick log (cardio/yoga/sports) with just name + duration + notes.
export const sessionTypeEnum = pgEnum('session_type', ['strength', 'activity']);

// An executed workout — written atomically when the user finishes (the
// in-progress draft lives client-side in Zustand until then). This is history,
// so links to the template/planned entry are nullable + ON DELETE SET NULL:
// deleting them never erases a logged workout. The name is snapshotted so the
// record stays readable after a template is gone.
export const workoutSessions = pgTable(
  'workout_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The calendar entry this fulfilled, if any (ad-hoc workouts have none).
    plannedSessionId: uuid('planned_session_id').references(() => plannedSessions.id, {
      onDelete: 'set null',
    }),
    // The template this was based on (null for activity logs or after deletion).
    workoutTemplateId: uuid('workout_template_id').references(() => workoutTemplates.id, {
      onDelete: 'set null',
    }),
    sessionType: sessionTypeEnum('session_type').notNull(),
    // Display name — template name snapshot (strength) or user-entered (activity).
    name: text('name').notNull(),
    performedDate: date('performed_date').notNull(),
    durationMinutes: integer('duration_minutes'),
    rating: smallint('rating'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Calendar/history range queries scan by user over a date window.
    index('workout_sessions_user_date_idx').on(table.userId, table.performedDate),
    check('workout_sessions_rating_range', sql`${table.rating} between 1 and 5`),
    check('workout_sessions_duration_positive', sql`${table.durationMinutes} > 0`),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;
