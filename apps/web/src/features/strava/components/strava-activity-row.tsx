import { format, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { StravaSessionItem } from '@gym-bro/shared';

import { stravaActivityIcon } from '../utils/activity-icon';
import { formatDistance, formatDuration } from '../utils/format';
import { activityMetrics } from '../utils/metrics';

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
            {activityMetrics(session).map((m) => (
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
