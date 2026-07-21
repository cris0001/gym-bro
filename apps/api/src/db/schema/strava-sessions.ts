import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  smallint,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users';

// An endurance activity imported from Strava, kept in its own table (separate from
// workout_sessions); the calendar/history/stats read both and merge. Strava is the
// only integration, so this is Strava-specific — no source-agnostic abstraction.
//
// Idempotency: (user_id, strava_activity_id) is UNIQUE, so a manual re-import or a
// later auto-sync upserts the same activity instead of duplicating it. Metrics are
// nullable because not every activity has them (a gym session synced from Strava has
// no distance; calories only come from Strava's per-activity detail endpoint). `raw`
// keeps the original payload so new columns can be backfilled without re-fetching.
export const stravaSessions = pgTable(
  'strava_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Strava's activity id. Text, not bigint: Strava ids exceed JS's safe integer
    // range and we never do arithmetic on it — it's only an identity/dedup key.
    stravaActivityId: text('strava_activity_id').notNull(),
    // Strava sport_type ("Run", "Ride", "Swim", "Workout", …). Text, not an enum —
    // Strava has ~50 types and keeps adding them.
    activityType: text('activity_type').notNull(),
    // Strava activity title.
    name: text('name').notNull(),
    // UTC start (Strava start_date).
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    // Strava timezone string, to render local time client-side.
    timezone: text('timezone'),
    // Calendar day = date part of Strava start_date_local. Denormalized for indexed
    // range scans, mirroring workout_sessions.performed_date.
    localDate: date('local_date').notNull(),
    // Summary metrics (all nullable). numeric precisions sized for realistic maxima.
    distanceM: numeric('distance_m', { precision: 10, scale: 2 }),
    movingTimeS: integer('moving_time_s'),
    elapsedTimeS: integer('elapsed_time_s'),
    elevationGainM: numeric('elevation_gain_m', { precision: 8, scale: 2 }),
    averageSpeedMs: numeric('average_speed_ms', { precision: 8, scale: 3 }),
    maxSpeedMs: numeric('max_speed_ms', { precision: 8, scale: 3 }),
    averageHeartrate: numeric('average_heartrate', { precision: 5, scale: 1 }),
    maxHeartrate: smallint('max_heartrate'),
    calories: numeric('calories', { precision: 8, scale: 2 }),
    // The user's own annotations (kept separate from Strava's description).
    rating: smallint('rating'),
    note: text('note'),
    // Raw Strava summary payload, to backfill new columns later without re-fetching.
    raw: jsonb('raw'),
    // When we last pulled/updated this from Strava.
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // The dedup linchpin: one row per (user, Strava activity). Doubles as the upsert
    // lookup index.
    uniqueIndex('strava_sessions_user_activity_unique').on(table.userId, table.stravaActivityId),
    // Calendar/history range queries scan by user over a date window.
    index('strava_sessions_user_date_idx').on(table.userId, table.localDate),
    check('strava_sessions_distance_non_negative', sql`${table.distanceM} >= 0`),
    check('strava_sessions_moving_time_positive', sql`${table.movingTimeS} > 0`),
    check('strava_sessions_elapsed_time_positive', sql`${table.elapsedTimeS} > 0`),
    check('strava_sessions_elevation_non_negative', sql`${table.elevationGainM} >= 0`),
    check('strava_sessions_avg_hr_non_negative', sql`${table.averageHeartrate} >= 0`),
    check('strava_sessions_rating_range', sql`${table.rating} between 1 and 5`),
  ],
);

// Inferred row types for repository code (internal — not the API contract, which is
// defined by Zod schemas in packages/shared).
export type StravaSession = typeof stravaSessions.$inferSelect;
export type NewStravaSession = typeof stravaSessions.$inferInsert;
