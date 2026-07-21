import { format, parseISO } from 'date-fns';
import { Activity, Bike, ChevronDown, Footprints, Waves } from 'lucide-react';

import { cn } from '@/lib/utils';

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
} from '../utils/format';

// A rough icon per activity family; anything else falls back to a generic activity.
function iconFor(activityType: string) {
  if (/ride|bike|cycl/i.test(activityType)) return Bike;
  if (/swim/i.test(activityType)) return Waves;
  if (/run|walk|hike/i.test(activityType)) return Footprints;
  return Activity;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

// One imported Strava activity. Collapsed: orange type icon, name, date + the primary
// metric. Tapping expands a grid of all recorded metrics + a link to Strava.
export function StravaActivityRow({
  session,
  expanded,
  onToggle,
}: {
  session: StravaSessionItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = iconFor(session.activityType);
  const primary =
    session.distanceM !== null
      ? formatDistance(session.distanceM)
      : formatDuration(session.movingTimeS);

  return (
    <li id={`strava-activity-${session.id}`} className="bg-card overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/50 active:bg-muted flex w-full items-center gap-3 p-3 text-left transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{session.name}</span>
          <span className="text-muted-foreground text-xs">
            {session.activityType} · {format(parseISO(session.localDate), 'EEE, MMM d')} · {primary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground size-4 shrink-0 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="border-t p-3">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Distance" value={formatDistance(session.distanceM)} />
            <Metric label="Moving" value={formatDuration(session.movingTimeS)} />
            <Metric
              label={isPaceType(session.activityType) ? 'Pace' : 'Speed'}
              value={
                isPaceType(session.activityType)
                  ? formatPace(session.averageSpeedMs)
                  : formatSpeed(session.averageSpeedMs)
              }
            />
            <Metric label="Elevation" value={formatElevation(session.elevationGainM)} />
            <Metric label="Avg HR" value={formatHeartrate(session.averageHeartrate)} />
            <Metric label="Max HR" value={formatHeartrate(session.maxHeartrate)} />
            <Metric label="Calories" value={formatCalories(session.calories)} />
          </div>
          <a
            href={`https://www.strava.com/activities/${session.stravaActivityId}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline"
          >
            View on Strava ↗
          </a>
        </div>
      )}
    </li>
  );
}
