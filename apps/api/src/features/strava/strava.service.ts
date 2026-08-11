import { jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { env } from '../../lib/env';
import { InternalError, NotFoundError, UnauthorizedError, ValidationError } from '../../lib/errors';
import * as stravaRepository from './strava.repository';

// Business logic for the Strava OAuth connection. No Drizzle here. Talks to Strava's
// OAuth endpoints over fetch; persistence goes through the repository.

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const TOKEN_URL = 'https://www.strava.com/oauth/token';
const ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';
const ACTIVITY_DETAIL_URL = 'https://www.strava.com/api/v3/activities';
// How many recent activities a manual "import recent" pulls (one page).
const IMPORT_PER_PAGE = 50;
// Read-all so private activities are importable too.
const SCOPE = 'activity:read_all';
// The `state` is a short-lived signed token carrying the user id, so the callback
// trusts who is connecting without relying on the cross-site auth cookie surviving
// the Strava round-trip. A distinct purpose claim stops an auth JWT being replayed
// as state (and vice versa).
const STATE_PURPOSE = 'strava_oauth';
const STATE_EXPIRY = '10m';
const stateSecret = new TextEncoder().encode(env.JWT_SECRET);

// Strava's optional-but-configured credentials live on `env` (all-or-none). Resolve
// them here so every OAuth path fails with one clear error when Strava isn't set up.
function requireConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } = env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REDIRECT_URI) {
    throw new InternalError('Strava integration is not configured');
  }
  return {
    clientId: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    redirectUri: STRAVA_REDIRECT_URI,
  };
}

// --- OAuth state ---

async function signState(userId: string): Promise<string> {
  return new SignJWT({ purpose: STATE_PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(STATE_EXPIRY)
    .sign(stateSecret);
}

async function verifyState(state: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(state, stateSecret, { algorithms: ['HS256'] });
    if (payload.purpose !== STATE_PURPOSE || typeof payload.sub !== 'string') {
      throw new UnauthorizedError('Invalid OAuth state');
    }
    return payload.sub;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError('Invalid or expired OAuth state');
  }
}

// --- Connect ---

// The Strava authorize URL to redirect the user to (with a signed state).
export async function getAuthorizeUrl(userId: string): Promise<string> {
  const { clientId, redirectUri } = requireConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPE,
    state: await signState(userId),
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

// --- Callback / token exchange ---

// Only the fields we use from Strava's token response. `athlete` is present on the
// initial code exchange, absent on a refresh. firstname/lastname/username feed the
// "Connected as …" label; all optional since Strava may omit them.
const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(), // unix seconds
  athlete: z
    .object({
      id: z.number(),
      firstname: z.string().nullish(),
      lastname: z.string().nullish(),
      username: z.string().nullish(),
    })
    .optional(),
});
type TokenResponse = z.infer<typeof tokenResponseSchema>;

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });
  } catch {
    throw new InternalError('Could not reach Strava');
  }
  if (!response.ok) {
    throw new ValidationError('Strava rejected the authorization');
  }
  const parsed = tokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new InternalError('Unexpected response from Strava');
  }
  return parsed.data;
}

// Verify the state, exchange the code for tokens, and store the connection. `scope`
// comes from the callback query (Strava returns granted scope there, not in the
// token response). Returns the resolved user id so the route can finish the redirect.
export async function completeConnection(input: {
  code: string;
  state: string;
  scope: string | null;
}): Promise<string> {
  const userId = await verifyState(input.state);
  const { clientId, clientSecret } = requireConfig();
  const token = await postToken({
    client_id: clientId,
    client_secret: clientSecret,
    code: input.code,
    grant_type: 'authorization_code',
  });
  if (!token.athlete) {
    throw new InternalError('Strava did not return an athlete');
  }
  // Display name: "First Last", falling back to the username, then null. A plain `||`
  // chain would be cleaner but the lint rule pushes nullish coalescing, which wouldn't
  // fall through on an empty join — so pick the full name explicitly when it's non-empty.
  const fullName = [token.athlete.firstname, token.athlete.lastname].filter(Boolean).join(' ');
  const athleteName = fullName !== '' ? fullName : (token.athlete.username ?? null);
  await stravaRepository.upsertConnection({
    userId,
    athleteId: String(token.athlete.id),
    athleteName,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(token.expires_at * 1000),
    scope: input.scope,
  });
  return userId;
}

// --- Status / disconnect ---

export async function getStatus(userId: string): Promise<StravaConnectionStatus> {
  const connection = await stravaRepository.findConnectionByUserId(userId);
  if (!connection) {
    return { connected: false, athleteId: null, athleteName: null, scope: null, lastSyncAt: null };
  }
  return {
    connected: true,
    athleteId: connection.athleteId,
    athleteName: connection.athleteName,
    scope: connection.scope,
    lastSyncAt: connection.lastSyncAt ? connection.lastSyncAt.toISOString() : null,
  };
}

export async function disconnect(userId: string): Promise<void> {
  await stravaRepository.deleteConnection(userId);
}

// Imported activities, newest first, optionally within a local-date window.
export async function listSessions(userId: string, from?: string, to?: string) {
  return stravaRepository.listStravaSessions(userId, from, to);
}

// Remove one imported activity locally (e.g. it was deleted on Strava). Does not touch
// Strava. Throws if it isn't the user's / doesn't exist.
export async function deleteSession(userId: string, id: string): Promise<void> {
  const deleted = await stravaRepository.deleteStravaSession(userId, id);
  if (!deleted) {
    throw new NotFoundError('Activity not found');
  }
}

// --- Access token for API calls (used by the import slice) ---

// A minute of slack so a token about to expire mid-request is refreshed first.
const EXPIRY_SLACK_MS = 60_000;

// A valid access token for the user, refreshing via the refresh_token grant when the
// current one is expired (or about to be). Throws if the user hasn't connected.
export async function getFreshAccessToken(userId: string): Promise<string> {
  const connection = await stravaRepository.findConnectionByUserId(userId);
  if (!connection) {
    throw new ValidationError('Strava is not connected');
  }
  if (connection.expiresAt.getTime() - EXPIRY_SLACK_MS > Date.now()) {
    return connection.accessToken;
  }
  const { clientId, clientSecret } = requireConfig();
  const token = await postToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: connection.refreshToken,
  });
  await stravaRepository.updateTokens(userId, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(token.expires_at * 1000),
  });
  return token.access_token;
}

// --- Import ---

// The summary fields we keep from Strava's /athlete/activities. Optional metrics are
// leniently typed — Strava omits HR fields for non-HR activities, etc. `passthrough`
// keeps the rest of the payload so it lands in `raw`.
const activitySummarySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    sport_type: z.string().optional(),
    type: z.string().optional(),
    start_date: z.string(),
    start_date_local: z.string(),
    timezone: z.string().optional(),
    distance: z.number().optional(),
    moving_time: z.number().optional(),
    elapsed_time: z.number().optional(),
    total_elevation_gain: z.number().optional(),
    average_speed: z.number().optional(),
    max_speed: z.number().optional(),
    average_heartrate: z.number().optional(),
    max_heartrate: z.number().optional(),
  })
  .passthrough();
const activitiesResponseSchema = z.array(activitySummarySchema);
type ActivitySummary = z.infer<typeof activitySummarySchema>;

// A positive number, else null — keeps zero/absent durations out of the "> 0" CHECKs.
const positiveOrNull = (value: number | undefined): number | null =>
  typeof value === 'number' && value > 0 ? value : null;
const numberOrNull = (value: number | undefined): number | null =>
  typeof value === 'number' ? value : null;

function toUpsert(userId: string, activity: ActivitySummary): stravaRepository.StravaSessionUpsert {
  return {
    userId,
    stravaActivityId: String(activity.id),
    // sport_type is the current field; fall back to the legacy `type`.
    activityType: activity.sport_type ?? activity.type ?? 'Workout',
    name: activity.name,
    startedAt: new Date(activity.start_date),
    timezone: activity.timezone ?? null,
    // Calendar day = the local date part; Strava already localizes start_date_local.
    localDate: activity.start_date_local.slice(0, 10),
    distanceM: numberOrNull(activity.distance),
    movingTimeS: positiveOrNull(activity.moving_time),
    elapsedTimeS: positiveOrNull(activity.elapsed_time),
    elevationGainM: numberOrNull(activity.total_elevation_gain),
    averageSpeedMs: numberOrNull(activity.average_speed),
    maxSpeedMs: numberOrNull(activity.max_speed),
    averageHeartrate: numberOrNull(activity.average_heartrate),
    maxHeartrate: activity.max_heartrate != null ? Math.round(activity.max_heartrate) : null,
    // Not in the summary response — only Strava's per-activity detail has it.
    calories: null,
    raw: activity,
  };
}

// Calories live only on Strava's per-activity detail endpoint (not the summary list).
const activityDetailSchema = z.object({ calories: z.number().nullable().optional() }).passthrough();

// One extra call to get an activity's calories. Resilient: any failure (rate limit,
// network) returns null so a single bad detail never fails the whole import.
async function fetchActivityCalories(
  accessToken: string,
  activityId: string,
): Promise<number | null> {
  try {
    const response = await fetch(`${ACTIVITY_DETAIL_URL}/${activityId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const parsed = activityDetailSchema.safeParse(await response.json());
    return parsed.success ? (parsed.data.calories ?? null) : null;
  } catch {
    return null;
  }
}

// Fetch the most recent activities and upsert them (idempotent). Returns how many were
// imported. Calories come from the detail endpoint, fetched only for activities that
// don't already have them stored — so re-imports don't re-spend the rate budget.
export async function importRecentActivities(userId: string): Promise<{ imported: number }> {
  const accessToken = await getFreshAccessToken(userId);
  const connection = await stravaRepository.findConnectionByUserId(userId);
  const params = new URLSearchParams({ per_page: String(IMPORT_PER_PAGE) });
  // Incremental: pull only activities that started after the last successful sync, so a
  // re-import isn't re-processing (and re-reporting) the whole recent page. The first
  // sync has no high-water mark and pulls the recent page. (An activity edited on Strava
  // after we synced won't be re-fetched — acceptable for this personal tracker.)
  if (connection?.lastSyncAt) {
    params.set('after', String(Math.floor(connection.lastSyncAt.getTime() / 1000)));
  }
  const url = `${ACTIVITIES_URL}?${params.toString()}`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  } catch {
    throw new InternalError('Could not reach Strava');
  }
  if (!response.ok) {
    throw new InternalError('Strava activity fetch failed');
  }
  const parsed = activitiesResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new InternalError('Unexpected activities response from Strava');
  }
  const activities = parsed.data;
  const storedCalories = await stravaRepository.findStoredCaloriesByIds(
    userId,
    activities.map((a) => String(a.id)),
  );
  for (const activity of activities) {
    const id = String(activity.id);
    // Keep already-stored calories; otherwise fetch the detail once.
    let calories = storedCalories.get(id) ?? null;
    calories ??= await fetchActivityCalories(accessToken, id);
    await stravaRepository.upsertStravaSession({ ...toUpsert(userId, activity), calories });
  }
  await stravaRepository.updateLastSync(userId, new Date());
  return { imported: activities.length };
}
