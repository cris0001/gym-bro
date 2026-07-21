import {
  Activity,
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  PersonStanding,
  Waves,
  type LucideIcon,
} from 'lucide-react';

// A sport-appropriate icon per Strava activity type. (Strava's own glyphs are
// proprietary assets, so these are the closest lucide equivalents.) Shared by the
// activity list, the dashboard filter, and the calendar markers.
export function stravaActivityIcon(activityType: string): LucideIcon {
  const t = activityType.toLowerCase();
  if (/ride|bike|cycl/.test(t)) return Bike;
  if (t.includes('swim')) return Waves;
  if (/hike|mountaineer|climb|snow|ski/.test(t)) return Mountain;
  if (/run|walk/.test(t)) return Footprints;
  if (/weight|workout|crossfit|hiit|strength/.test(t)) return Dumbbell;
  if (/yoga|pilates|therapy|stretch|mobility|flexibility|meditat/.test(t)) return PersonStanding;
  return Activity;
}
