import { eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { stravaConnections } from '../../db/schema/strava-connections';

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
