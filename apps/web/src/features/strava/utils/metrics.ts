import type { StravaSessionItem } from '@gym-bro/shared';

import {
  formatCalories,
  formatDistance,
  formatDuration,
  formatElevation,
  formatHeartrate,
  formatPace,
  formatSpeed,
  isPaceType,
} from './format';

// Only the metrics the activity actually recorded, richest first — so a ride shows
// power/cadence, a run shows pace, and a sparse activity stays tidy. Shared by both
// Strava activity layouts.
export function activityMetrics(s: StravaSessionItem): { label: string; value: string }[] {
  const paced = isPaceType(s.activityType);
  const metrics: { label: string; value: string }[] = [];
  const add = (label: string, value: string) => metrics.push({ label, value });

  if (s.distanceM !== null) add('Distance', formatDistance(s.distanceM));
  if (s.movingTimeS !== null) add('Moving', formatDuration(s.movingTimeS));
  if (s.elapsedTimeS !== null) add('Elapsed', formatDuration(s.elapsedTimeS));
  if (s.averageSpeedMs !== null) {
    add(
      paced ? 'Pace' : 'Avg speed',
      paced ? formatPace(s.averageSpeedMs) : formatSpeed(s.averageSpeedMs),
    );
  }
  if (s.maxSpeedMs !== null && !paced) add('Max speed', formatSpeed(s.maxSpeedMs));
  if (s.elevationGainM !== null) add('Elevation', formatElevation(s.elevationGainM));
  if (s.averageHeartrate !== null) add('Avg HR', formatHeartrate(s.averageHeartrate));
  if (s.maxHeartrate !== null) add('Max HR', formatHeartrate(s.maxHeartrate));
  if (s.averageCadence !== null) add('Cadence', String(Math.round(s.averageCadence)));
  if (s.averageWatts !== null) add('Avg power', `${Math.round(s.averageWatts)} W`);
  if (s.maxWatts !== null) add('Max power', `${Math.round(s.maxWatts)} W`);
  if (s.calories !== null) add('Calories', formatCalories(s.calories));
  if (s.sufferScore !== null) add('Relative effort', String(Math.round(s.sufferScore)));
  if (s.kudosCount !== null) add('Kudos', String(s.kudosCount));
  if (s.achievementCount !== null) add('Achievements', String(s.achievementCount));
  return metrics;
}
