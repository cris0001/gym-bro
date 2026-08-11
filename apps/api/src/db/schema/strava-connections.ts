import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// A user's Strava OAuth connection — one per user (UNIQUE user_id). Stores the
// tokens minted by the OAuth consent flow; each token only grants access to its own
// athlete's activities. Tokens are stored plaintext: single-user/demo app, Neon
// encrypts at rest, and DB access is limited to the owner (no app-level crypto, to
// match the rest of the codebase). Deleting the user removes the connection.
export const stravaConnections = pgTable(
  'strava_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Strava athlete id from the token response.
    athleteId: text('athlete_id').notNull(),
    // Athlete display name (first + last, or username) captured at connect for the
    // "Connected as …" label. Nullable: rows from before this column, and cases where
    // Strava returns no name. The token refresh response omits `athlete`, so this is
    // only ever set on (re)connect — never cleared by a refresh.
    athleteName: text('athlete_name'),
    // Short-lived (Strava access tokens expire ~6h); refreshed via refresh_token.
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    // Access-token expiry; refresh when now() is past this.
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Granted scopes, e.g. "read,activity:read_all".
    scope: text('scope'),
    // High-water mark for incremental sync (feeds Strava's `after` param). Null until
    // the first sync completes.
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Service sets this to now() on every update (no DB trigger).
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One Strava connection per user; also the upsert target on (re)connect.
    uniqueIndex('strava_connections_user_unique').on(table.userId),
  ],
);

// Inferred row types for repository code (internal — not the API contract, which is
// defined by Zod schemas in packages/shared).
export type StravaConnection = typeof stravaConnections.$inferSelect;
export type NewStravaConnection = typeof stravaConnections.$inferInsert;
