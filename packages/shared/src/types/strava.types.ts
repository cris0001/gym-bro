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

// One imported Strava activity as sent to the client (numeric columns coerced to
// numbers; startedAt is an ISO string; localDate is 'YYYY-MM-DD'). The raw payload
// and tokens are never exposed. Metrics are null when the activity didn't record
// them.
export interface StravaSessionItem {
  id: string;
  stravaActivityId: string;
  activityType: string;
  name: string;
  startedAt: string;
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
  rating: number | null;
  note: string | null;
}
