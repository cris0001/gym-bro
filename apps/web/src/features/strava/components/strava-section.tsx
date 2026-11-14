import { StravaLogo } from '@/components/strava-logo';

import { STRAVA_CONNECT_URL } from '../api/strava';
import { useStravaSessions } from '../hooks/use-strava-sessions';
import { useStravaStatus } from '../hooks/use-strava-status';
import { StravaLastActivityCard } from './strava-last-activity-card';
import { StravaWeeklyCard } from './strava-weekly-card';

// The dashboard's Strava block. When linked: the latest activity (route map when it
// has one) and a weekly-volume chart for its sport. When not linked: a connect CTA.
export function StravaSection() {
  const { data: status } = useStravaStatus();
  const { data: sessions = [] } = useStravaSessions();
  const connected = status?.connected ?? false;

  if (!connected) {
    return (
      <div className="bg-card flex flex-col gap-2 rounded-xl border p-5">
        <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase">
          <StravaLogo className="size-3.5 text-[#fc4c02]" />
          Strava
        </p>
        <span className="text-muted-foreground text-sm">
          Link Strava to see your activities here.
        </span>
        <a
          href={STRAVA_CONNECT_URL}
          className="bg-primary text-primary-foreground mt-1 inline-flex h-9 w-fit items-center rounded-full px-4 text-sm font-semibold"
        >
          Connect Strava
        </a>
      </div>
    );
  }

  return (
    // A rule above sets Strava apart from the app's own cards; below it the last
    // activity and its sport's weekly volume share a row, like Weight / Last workout.
    <div className="grid gap-4 border-t pt-5 lg:grid-cols-2">
      <StravaLastActivityCard session={sessions[0] ?? null} />
      <StravaWeeklyCard sessions={sessions} />
    </div>
  );
}
