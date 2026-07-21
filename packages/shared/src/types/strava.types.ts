// Strava integration — cross-app types. Only the frontend-facing shapes live here;
// OAuth internals (token exchange, callback query) stay in the API feature.

// The connect state for the UI: whether this user has linked Strava, and (when
// linked) the athlete id, granted scope, and last successful sync. Timestamps are
// ISO strings on the wire.
export interface StravaConnectionStatus {
  connected: boolean;
  athleteId: string | null;
  scope: string | null;
  lastSyncAt: string | null;
}
