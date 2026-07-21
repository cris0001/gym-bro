import { jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { env } from '../../lib/env';
import { InternalError, UnauthorizedError, ValidationError } from '../../lib/errors';
import * as stravaRepository from './strava.repository';

// Business logic for the Strava OAuth connection. No Drizzle here. Talks to Strava's
// OAuth endpoints over fetch; persistence goes through the repository.

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const TOKEN_URL = 'https://www.strava.com/oauth/token';
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
// initial code exchange, absent on a refresh.
const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(), // unix seconds
  athlete: z.object({ id: z.number() }).optional(),
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
  await stravaRepository.upsertConnection({
    userId,
    athleteId: String(token.athlete.id),
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
    return { connected: false, athleteId: null, scope: null, lastSyncAt: null };
  }
  return {
    connected: true,
    athleteId: connection.athleteId,
    scope: connection.scope,
    lastSyncAt: connection.lastSyncAt ? connection.lastSyncAt.toISOString() : null,
  };
}

export async function disconnect(userId: string): Promise<void> {
  await stravaRepository.deleteConnection(userId);
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
