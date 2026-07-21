import { format, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';

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
import { stravaActivityIcon } from '../utils/activity-icon';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

// Only the metrics the activity actually recorded, so the grid naturally shows more
// for richer activities (power, cadence, effort) and stays tidy for sparse ones.
function buildMetrics(s: StravaSessionItem): { label: string; value: string }[] {
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
  const Icon = stravaActivityIcon(session.activityType);
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
            {buildMetrics(session).map((m) => (
              <Metric key={m.label} label={m.label} value={m.value} />
            ))}
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
