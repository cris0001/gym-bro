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
export type MetricLabels = Record<
  | 'distance'
  | 'moving'
  | 'elapsed'
  | 'pace'
  | 'avgSpeed'
  | 'maxSpeed'
  | 'elevation'
  | 'avgHr'
  | 'maxHr'
  | 'cadence'
  | 'avgPower'
  | 'maxPower'
  | 'calories'
  | 'relativeEffort'
  | 'kudos'
  | 'achievements',
  string
>;

export function activityMetrics(
  s: StravaSessionItem,
  m: MetricLabels,
): { label: string; value: string }[] {
  const paced = isPaceType(s.activityType);
  const metrics: { label: string; value: string }[] = [];
  const add = (label: string, value: string) => metrics.push({ label, value });

  if (s.distanceM !== null) add(m.distance, formatDistance(s.distanceM));
  if (s.movingTimeS !== null) add(m.moving, formatDuration(s.movingTimeS));
  if (s.elapsedTimeS !== null) add(m.elapsed, formatDuration(s.elapsedTimeS));
  if (s.averageSpeedMs !== null) {
    add(
      paced ? m.pace : m.avgSpeed,
      paced ? formatPace(s.averageSpeedMs) : formatSpeed(s.averageSpeedMs),
    );
  }
  if (s.maxSpeedMs !== null && !paced) add(m.maxSpeed, formatSpeed(s.maxSpeedMs));
  if (s.elevationGainM !== null) add(m.elevation, formatElevation(s.elevationGainM));
  if (s.averageHeartrate !== null) add(m.avgHr, formatHeartrate(s.averageHeartrate));
  if (s.maxHeartrate !== null) add(m.maxHr, formatHeartrate(s.maxHeartrate));
  if (s.averageCadence !== null) add(m.cadence, String(Math.round(s.averageCadence)));
  if (s.averageWatts !== null) add(m.avgPower, `${Math.round(s.averageWatts)} W`);
  if (s.maxWatts !== null) add(m.maxPower, `${Math.round(s.maxWatts)} W`);
  if (s.calories !== null) add(m.calories, formatCalories(s.calories));
  if (s.sufferScore !== null) add(m.relativeEffort, String(Math.round(s.sufferScore)));
  if (s.kudosCount !== null) add(m.kudos, String(s.kudosCount));
  if (s.achievementCount !== null) add(m.achievements, String(s.achievementCount));
  return metrics;
}
