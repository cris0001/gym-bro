import { eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { stravaConnections } from '../../db/schema/strava-connections';
import { stravaSessions } from '../../db/schema/strava-sessions';

// Drizzle queries for the Strava connection (OAuth tokens) — plain rows, no business
// logic. One row per user (UNIQUE user_id). Timestamps stay Date; Hono serializes
// them to ISO in responses.

export type StravaConnectionRow = typeof stravaConnections.$inferSelect;

// The token set written on connect / reconnect. lastSyncAt is intentionally not
// touched here — a reconnect refreshes credentials without discarding sync history.
export interface StravaConnectionUpsert {
  userId: string;
  athleteId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string | null;
}

export async function findConnectionByUserId(
  userId: string,
): Promise<StravaConnectionRow | undefined> {
  const [row] = await db
    .select()
    .from(stravaConnections)
    .where(eq(stravaConnections.userId, userId))
    .limit(1);
  return row;
}

// Insert or refresh the user's connection (upsert on the UNIQUE user_id).
export async function upsertConnection(data: StravaConnectionUpsert): Promise<StravaConnectionRow> {
  const [row] = await db
    .insert(stravaConnections)
    .values({
      userId: data.userId,
      athleteId: data.athleteId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      scope: data.scope,
    })
    .onConflictDoUpdate({
      target: stravaConnections.userId,
      set: {
        athleteId: data.athleteId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        scope: data.scope,
        updatedAt: new Date(),
      },
    })
    .returning();
  if (!row) {
    throw new Error('Strava connection upsert returned no row');
  }
  return row;
}

// Replace just the token set after a refresh (leaves athleteId / scope / lastSyncAt).
export async function updateTokens(
  userId: string,
  tokens: { accessToken: string; refreshToken: string; expiresAt: Date },
): Promise<StravaConnectionRow | undefined> {
  const [row] = await db
    .update(stravaConnections)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(stravaConnections.userId, userId))
    .returning();
  return row;
}

export async function deleteConnection(userId: string): Promise<StravaConnectionRow | undefined> {
  const [row] = await db
    .delete(stravaConnections)
    .where(eq(stravaConnections.userId, userId))
    .returning();
  return row;
}

// Move the connection's sync high-water mark forward (used after an import completes).
export async function updateLastSync(userId: string, when: Date): Promise<void> {
  await db
    .update(stravaConnections)
    .set({ lastSyncAt: when, updatedAt: new Date() })
    .where(eq(stravaConnections.userId, userId));
}

// --- Imported activities ---

// The service passes already-mapped values (numbers, not driver strings). numeric
// columns are stringified for the driver; null stays null.
export interface StravaSessionUpsert {
  userId: string;
  stravaActivityId: string;
  activityType: string;
  name: string;
  startedAt: Date;
  timezone: string | null;
  localDate: string;
  distanceM: number | null;
  movingTimeS: number | null;
  elapsedTimeS: number | null;
  elevationGainM: number | null;
  averageSpeedMs: number | null;
  maxSpeedMs: number | null;
  averageHeartrate: number | null;
  maxHeartrate: number | null;
  calories: number | null;
  raw: unknown;
}

const numStr = (value: number | null): string | null => (value === null ? null : value.toString());

// Upsert one imported activity — idempotent on (user_id, strava_activity_id). A
// re-import (or auto-sync) refreshes the snapshot instead of duplicating the row.
export async function upsertStravaSession(data: StravaSessionUpsert): Promise<void> {
  const values = {
    activityType: data.activityType,
    name: data.name,
    startedAt: data.startedAt,
    timezone: data.timezone,
    localDate: data.localDate,
    distanceM: numStr(data.distanceM),
    movingTimeS: data.movingTimeS,
    elapsedTimeS: data.elapsedTimeS,
    elevationGainM: numStr(data.elevationGainM),
    averageSpeedMs: numStr(data.averageSpeedMs),
    maxSpeedMs: numStr(data.maxSpeedMs),
    averageHeartrate: numStr(data.averageHeartrate),
    maxHeartrate: data.maxHeartrate,
    calories: numStr(data.calories),
    raw: data.raw,
  };
  await db
    .insert(stravaSessions)
    .values({ userId: data.userId, stravaActivityId: data.stravaActivityId, ...values })
    .onConflictDoUpdate({
      target: [stravaSessions.userId, stravaSessions.stravaActivityId],
      set: { ...values, lastSyncedAt: new Date(), updatedAt: new Date() },
    });
}
