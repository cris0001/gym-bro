import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { z } from 'zod';

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
  athleteName: string | null;
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
      athleteName: data.athleteName,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      scope: data.scope,
    })
    .onConflictDoUpdate({
      target: stravaConnections.userId,
      set: {
        athleteId: data.athleteId,
        athleteName: data.athleteName,
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

// Stored calories for the given activity ids (activityId → kcal | null). The import
// uses this to skip the extra Strava detail call for activities that already have it.
export async function findStoredCaloriesByIds(
  userId: string,
  activityIds: string[],
): Promise<Map<string, number | null>> {
  if (activityIds.length === 0) return new Map();
  const rows = await db
    .select({ id: stravaSessions.stravaActivityId, calories: stravaSessions.calories })
    .from(stravaSessions)
    .where(
      and(eq(stravaSessions.userId, userId), inArray(stravaSessions.stravaActivityId, activityIds)),
    );
  return new Map(rows.map((r) => [r.id, r.calories === null ? null : Number(r.calories)]));
}

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

// A numeric column comes back as a string, or null when not recorded.
const num = (value: string | null): number | null => (value === null ? null : Number(value));

// Extra numeric metrics we surface from the raw Strava payload (not their own
// columns). All optional/nullable — most activities record only some.
const rawExtrasSchema = z
  .object({
    average_cadence: z.number().nullable(),
    average_watts: z.number().nullable(),
    max_watts: z.number().nullable(),
    suffer_score: z.number().nullable(),
    kudos_count: z.number().nullable(),
    achievement_count: z.number().nullable(),
    // Strava's summary GPS track (encoded polyline) — absent/empty for indoor activities.
    map: z.object({ summary_polyline: z.string().nullable() }).nullable(),
  })
  .partial();

function extrasFromRaw(raw: unknown) {
  const parsed = rawExtrasSchema.safeParse(raw);
  const d = parsed.success ? parsed.data : {};
  const polyline = d.map?.summary_polyline ?? null;
  return {
    averageCadence: d.average_cadence ?? null,
    averageWatts: d.average_watts ?? null,
    maxWatts: d.max_watts ?? null,
    sufferScore: d.suffer_score ?? null,
    kudosCount: d.kudos_count ?? null,
    achievementCount: d.achievement_count ?? null,
    summaryPolyline: polyline && polyline.length > 0 ? polyline : null,
  };
}

// The wire shape of an imported activity (raw payload + tokens excluded, numerics
// coerced). startedAt stays a Date — Hono serializes it to ISO.
function mapSessionRow(row: {
  id: string;
  stravaActivityId: string;
  activityType: string;
  name: string;
  startedAt: Date;
  timezone: string | null;
  localDate: string;
  distanceM: string | null;
  movingTimeS: number | null;
  elapsedTimeS: number | null;
  elevationGainM: string | null;
  averageSpeedMs: string | null;
  maxSpeedMs: string | null;
  averageHeartrate: string | null;
  maxHeartrate: number | null;
  calories: string | null;
  rating: number | null;
  note: string | null;
  raw: unknown;
}) {
  return {
    id: row.id,
    stravaActivityId: row.stravaActivityId,
    activityType: row.activityType,
    name: row.name,
    startedAt: row.startedAt,
    timezone: row.timezone,
    localDate: row.localDate,
    distanceM: num(row.distanceM),
    movingTimeS: row.movingTimeS,
    elapsedTimeS: row.elapsedTimeS,
    elevationGainM: num(row.elevationGainM),
    averageSpeedMs: num(row.averageSpeedMs),
    maxSpeedMs: num(row.maxSpeedMs),
    averageHeartrate: num(row.averageHeartrate),
    maxHeartrate: row.maxHeartrate,
    calories: num(row.calories),
    rating: row.rating,
    note: row.note,
    ...extrasFromRaw(row.raw),
  };
}

export type StravaSessionListItem = ReturnType<typeof mapSessionRow>;

// A user's imported activities, newest first, optionally filtered to a local_date
// window (used by the calendar for a month; the Strava page loads all). Excludes the
// raw payload.
export async function listStravaSessions(
  userId: string,
  from?: string,
  to?: string,
): Promise<StravaSessionListItem[]> {
  const rows = await db
    .select({
      id: stravaSessions.id,
      stravaActivityId: stravaSessions.stravaActivityId,
      activityType: stravaSessions.activityType,
      name: stravaSessions.name,
      startedAt: stravaSessions.startedAt,
      timezone: stravaSessions.timezone,
      localDate: stravaSessions.localDate,
      distanceM: stravaSessions.distanceM,
      movingTimeS: stravaSessions.movingTimeS,
      elapsedTimeS: stravaSessions.elapsedTimeS,
      elevationGainM: stravaSessions.elevationGainM,
      averageSpeedMs: stravaSessions.averageSpeedMs,
      maxSpeedMs: stravaSessions.maxSpeedMs,
      averageHeartrate: stravaSessions.averageHeartrate,
      maxHeartrate: stravaSessions.maxHeartrate,
      calories: stravaSessions.calories,
      rating: stravaSessions.rating,
      note: stravaSessions.note,
      raw: stravaSessions.raw,
    })
    .from(stravaSessions)
    .where(
      and(
        eq(stravaSessions.userId, userId),
        from ? gte(stravaSessions.localDate, from) : undefined,
        to ? lte(stravaSessions.localDate, to) : undefined,
      ),
    )
    .orderBy(desc(stravaSessions.startedAt));
  return rows.map(mapSessionRow);
}

// Delete one imported activity (only the owner's). Returns the deleted id, or undefined
// when it isn't the user's / doesn't exist. Removing it locally doesn't affect Strava.
export async function deleteStravaSession(
  userId: string,
  id: string,
): Promise<{ id: string } | undefined> {
  const [row] = await db
    .delete(stravaSessions)
    .where(and(eq(stravaSessions.id, id), eq(stravaSessions.userId, userId)))
    .returning({ id: stravaSessions.id });
  return row;
}
