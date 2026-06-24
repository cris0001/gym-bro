import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';
import { workoutSessions } from './workout-sessions';
import { workoutTags } from './workout-tags';

// Junction: the tags attached to a finished workout (many-to-many). The session
// side cascades (deleting a session drops its tag links); the tag side uses
// RESTRICT because tags are soft-deleted (is_active), never hard-deleted while
// referenced — so a session keeps its tag even after the tag is soft-deleted.
export const workoutSessionTags = pgTable(
  'workout_session_tags',
  {
    workoutSessionId: uuid('workout_session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    workoutTagId: uuid('workout_tag_id')
      .notNull()
      .references(() => workoutTags.id, { onDelete: 'restrict' }),
    // Denormalized owner so links can be scoped/authorized without joining up.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One link per (session, tag); the composite key is the natural identity.
    primaryKey({ columns: [table.workoutSessionId, table.workoutTagId] }),
  ],
);

// Inferred row types for repository code (internal — not the API contract,
// which is defined by Zod schemas in packages/shared).
export type WorkoutSessionTag = typeof workoutSessionTags.$inferSelect;
export type NewWorkoutSessionTag = typeof workoutSessionTags.$inferInsert;
