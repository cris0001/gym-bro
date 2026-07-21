// Pure formatters for Strava activity metrics. Null (not recorded) renders as an
// em dash.

const DASH = '—';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

// Meters → "8.04 km" (≥1 km) or "850 m".
export function formatDistance(meters: number | null): string {
  if (meters === null) return DASH;
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`;
}

// Seconds → "43:30" or "1:12:05".
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return DASH;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// m/s → running pace "5:24 /km".
export function formatPace(speedMs: number | null): string {
  if (speedMs === null || speedMs <= 0) return DASH;
  const secPerKm = 1000 / speedMs;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  // Rounding can push seconds to 60.
  return s === 60 ? `${m + 1}:00 /km` : `${m}:${pad(s)} /km`;
}

// m/s → "24.8 km/h" (for rides etc.).
export function formatSpeed(speedMs: number | null): string {
  if (speedMs === null) return DASH;
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
}

export function formatElevation(meters: number | null): string {
  if (meters === null) return DASH;
  return `${Math.round(meters)} m`;
}

export function formatHeartrate(bpm: number | null): string {
  if (bpm === null) return DASH;
  return `${Math.round(bpm)} bpm`;
}

export function formatCalories(kcal: number | null): string {
  if (kcal === null) return DASH;
  return `${Math.round(kcal)} kcal`;
}

// Pace suits foot sports; speed suits wheeled/water sports. A loose check on the
// activity type keeps the primary metric sensible.
const PACE_TYPES = /run|walk|hike/i;
export function isPaceType(activityType: string): boolean {
  return PACE_TYPES.test(activityType);
}
