// Coarse sport buckets over Strava's many activity types, so e.g. an outdoor Ride, a
// VirtualRide and a GravelRide chart together as "Rides". Keyword-based like
// stravaActivityIcon, so new Strava types still land somewhere sensible.
export type SportGroup = 'ride' | 'run' | 'walk' | 'swim' | 'other';

export const SPORT_GROUP_LABEL: Record<SportGroup, string> = {
  ride: 'Rides',
  run: 'Runs',
  walk: 'Walks & hikes',
  swim: 'Swims',
  other: 'Other',
};

export function sportGroup(activityType: string): SportGroup {
  const t = activityType.toLowerCase();
  if (/ride|bike|cycl/.test(t)) return 'ride';
  if (t.includes('run')) return 'run';
  if (/walk|hike/.test(t)) return 'walk';
  if (t.includes('swim')) return 'swim';
  return 'other';
}
