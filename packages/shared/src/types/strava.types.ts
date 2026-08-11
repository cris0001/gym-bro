// Strava integration — cross-app types. Only the frontend-facing shapes live here;
// OAuth internals (token exchange, callback query) stay in the API feature.

// The connect state for the UI: whether this user has linked Strava, and (when
// linked) the athlete id, display name, granted scope, and last successful sync.
// Timestamps are ISO strings on the wire. athleteName is null for connections made
// before it was captured, or when Strava returned no name.
export interface StravaConnectionStatus {
  connected: boolean;
  athleteId: string | null;
  athleteName: string | null;
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
  // Extra metrics pulled from the raw Strava payload when present (power, cadence,
  // relative effort, social counts) — null when the activity didn't record them.
  averageCadence: number | null;
  averageWatts: number | null;
  maxWatts: number | null;
  sufferScore: number | null;
  kudosCount: number | null;
  achievementCount: number | null;
  // Strava's summary GPS track as an encoded polyline (decoded client-side into a route
  // sketch). Null for activities without GPS (indoor, manual).
  summaryPolyline: string | null;
}
