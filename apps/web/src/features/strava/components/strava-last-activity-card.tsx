import { parseISO } from 'date-fns';

import type { StravaSessionItem } from '@gym-bro/shared';

import { StravaLogo } from '@/components/strava-logo';

import { stravaActivityIcon } from '../utils/activity-icon';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  isPaceType,
} from '../utils/format';
import { RouteMap } from './route-map';
import { formatDate } from '@/lib/i18n/date-format';

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// The dashboard's latest-activity card: name, date and the big metrics, with the route
// map beside them when the activity has one; a sport icon always sits next to the name.
// Indoor activities (stationary bike, gym, yoga) carry no route and often no distance —
// the map is then left out, and so are any missing metrics.
export function StravaLastActivityCard({ session }: { session: StravaSessionItem | null }) {
  if (!session) {
    return (
      <div className="bg-card flex flex-col gap-2 rounded-xl border p-5">
        <StravaLabel>Last activity</StravaLabel>
        <span className="text-muted-foreground text-sm">No activities imported yet.</span>
      </div>
    );
  }

  const Icon = stravaActivityIcon(session.activityType);
  // Strava reports indoor/virtual sessions with distance and speed as 0 rather than
  // missing, so a zero counts as "not recorded" here too.
  const hasDistance = (session.distanceM ?? 0) > 0;
  const hasSpeed = hasDistance && (session.averageSpeedMs ?? 0) > 0;
  const metrics = [
    {
      label: 'Distance',
      value: hasDistance ? formatDistance(session.distanceM) : null,
    },
    {
      label: 'Time',
      value: session.movingTimeS ? formatDuration(session.movingTimeS) : null,
    },
    {
      label: isPaceType(session.activityType) ? 'Pace' : 'Speed',
      value: hasSpeed
        ? isPaceType(session.activityType)
          ? formatPace(session.averageSpeedMs)
          : formatSpeed(session.averageSpeedMs)
        : null,
    },
  ].filter((metric): metric is { label: string; value: string } => metric.value !== null);

  return (
    // Layout follows the card's own width (container query), not the viewport: the map
    // sits beside the text only once the card is ≥ 32rem wide, otherwise below it.
    <div className="bg-card @container rounded-xl border p-5">
      <div className="flex flex-col gap-4 @lg:flex-row @lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <StravaLabel>Last activity</StravaLabel>
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-secondary text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-lg leading-snug font-semibold break-words">
                {session.name}
              </p>
              <p className="text-muted-foreground text-[13px]">
                {formatDate(parseISO(session.startedAt), 'EEEE, MMM d')}
              </p>
            </div>
          </div>
          {metrics.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-3">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-heading text-lg leading-tight font-bold whitespace-nowrap tabular-nums">
                    {metric.value}
                  </p>
                  <p className="text-muted-foreground text-[11px]">{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {session.summaryPolyline ? (
          <RouteMap
            polyline={session.summaryPolyline}
            className="h-40 w-full shrink-0 overflow-hidden rounded-lg @lg:h-auto @lg:min-h-40 @lg:w-40"
          />
        ) : null}
      </div>
    </div>
  );
}

function StravaLabel({ children }: { children: string }) {
  return (
    <p className={`${microLabel} flex items-center gap-2`}>
      <StravaLogo className="size-4.5 text-[#fc4c02]" />
      {children}
    </p>
  );
}
