import { Activity, Bike, Footprints, Waves, type LucideIcon } from 'lucide-react';

// A rough icon per Strava activity family; anything else falls back to a generic
// activity. Shared by the activity list and the calendar markers.
export function stravaActivityIcon(activityType: string): LucideIcon {
  if (/ride|bike|cycl/i.test(activityType)) return Bike;
  if (/swim/i.test(activityType)) return Waves;
  if (/run|walk|hike/i.test(activityType)) return Footprints;
  return Activity;
}
