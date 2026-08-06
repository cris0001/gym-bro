import { format, parseISO } from 'date-fns';
import { Activity, CalendarRange } from 'lucide-react';

import { STRAVA_CONNECT_URL } from '../api/strava';
import { useStravaSessions } from '../hooks/use-strava-sessions';
import { useStravaStatus } from '../hooks/use-strava-status';
import { stravaActivityIcon } from '../utils/activity-icon';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  isPaceType,
} from '../utils/format';
import { summarize } from '../utils/stats';
import { RouteMap } from './route-map';

// The dashboard's Strava block: its own section below the core cards. When linked it
// splits into two cards — the latest activity and a current-month summary; when not,
// a connect CTA.
export function StravaSection() {
  const { data: status } = useStravaStatus();
  const { data: sessions = [] } = useStravaSessions();
  const connected = status?.connected ?? false;

  if (!connected) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Strava</h2>
        <div className="bg-card flex flex-col gap-2 rounded-2xl border p-4">
          <span className="text-muted-foreground text-sm">
            Link Strava to see your activities here.
          </span>
          <a
            href={STRAVA_CONNECT_URL}
            className="bg-primary text-primary-foreground mt-1 inline-flex h-9 w-fit items-center rounded-md px-3 text-sm font-medium"
          >
            Connect Strava
          </a>
        </div>
      </section>
    );
  }

  const monthPrefix = format(new Date(), 'yyyy-MM');
  const summary = summarize(sessions.filter((s) => s.localDate.startsWith(monthPrefix)));
  const last = sessions[0] ?? null;
  const LastIcon = last ? stravaActivityIcon(last.activityType) : Activity;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Strava</h2>
      <div className="grid items-start gap-4 sm:grid-cols-2">
        {/* Card 1 — the latest imported activity, tall enough to carry its route map. */}
        <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:min-h-[17rem]">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#fbe3d4] text-[#d15b28]">
              <Activity className="size-4" />
            </span>
            <span className="text-muted-foreground">Last activity</span>
          </div>
          {last ? (
            <>
              <div className="flex items-center gap-2">
                <LastIcon className="text-muted-foreground size-5 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{last.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {format(parseISO(last.startedAt), 'EEE, MMM d')}
                  </span>
                </span>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{formatDistance(last.distanceM)}</span>
                <span>{formatDuration(last.movingTimeS)}</span>
                <span>
                  {isPaceType(last.activityType)
                    ? formatPace(last.averageSpeedMs)
                    : formatSpeed(last.averageSpeedMs)}
                </span>
              </div>
              {last.summaryPolyline ? (
                <RouteMap polyline={last.summaryPolyline} className="min-h-40 flex-1" />
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">No activities imported yet.</span>
          )}
        </div>

        {/* Card 2 — a compact current-month summary. */}
        <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#fbe3d4] text-[#d15b28]">
              <CalendarRange className="size-4" />
            </span>
            <span className="text-muted-foreground">This month</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold">{summary.count}</div>
              <div className="text-muted-foreground text-[10px]">activities</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatDistance(summary.distanceM)}</div>
              <div className="text-muted-foreground text-[10px]">distance</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatDuration(summary.movingTimeS)}</div>
              <div className="text-muted-foreground text-[10px]">moving</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
