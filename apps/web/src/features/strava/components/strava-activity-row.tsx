import { parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { StravaSessionItem } from '@gym-bro/shared';

import { useDeleteStravaSession } from '../hooks/use-delete-strava-session';
import { stravaActivityIcon } from '../utils/activity-icon';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  isPaceType,
} from '../utils/format';
import { activityMetrics } from '../utils/metrics';
import { RouteMap } from './route-map';
import { formatDate } from '@/lib/i18n/date-format';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

// A desktop stat column: the value over a tiny caption.
function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <span className="hidden w-20 shrink-0 md:block">
      <span className="block text-sm font-bold tabular-nums">{value}</span>
      <span className="text-faint-foreground block text-[10.5px] tracking-[0.06em] uppercase">
        {caption}
      </span>
    </span>
  );
}

// One imported Strava activity, as a row inside its month's card. Collapsed: the sport
// icon on a square tint, the name, and under it the date — plus time · distance on
// phones; on desktop distance / time / pace (or speed) get their own columns.
// Tapping expands every recorded metric, the route map, the Strava link and Remove.
export function StravaActivityRow({
  session,
  expanded,
  onToggle,
}: {
  session: StravaSessionItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const remove = useDeleteStravaSession();
  const confirm = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: `Remove "${session.name}"?`,
      description: 'Removes it from the app only — your Strava activity is untouched.',
      confirmText: 'Remove',
      destructive: true,
    });
    if (ok) remove.mutate(session.id);
  }

  const Icon = stravaActivityIcon(session.activityType);
  const hasDistance = session.distanceM !== null && session.distanceM > 0;
  const time = formatDuration(session.movingTimeS);
  const date = formatDate(parseISO(session.localDate), 'EEE, MMM d');
  const paced = isPaceType(session.activityType);
  const pace =
    session.averageSpeedMs !== null && hasDistance
      ? paced
        ? formatPace(session.averageSpeedMs)
        : formatSpeed(session.averageSpeedMs)
      : null;

  return (
    <li id={`strava-activity-${session.id}`} className="border-t first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/50 active:bg-muted flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors md:px-4"
        aria-expanded={expanded}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fbe3d4] text-[#d15b28] dark:bg-[#45291b] dark:text-[#ff7a3d]">
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold">{session.name}</span>
          {/* Phones: date · time · distance (the rest on expand). Desktop: date · type,
              with the numbers in their own columns. */}
          <span className="text-muted-foreground block truncate text-xs tabular-nums md:hidden">
            {[date, time, hasDistance ? formatDistance(session.distanceM) : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
          <span className="text-muted-foreground hidden truncate text-xs md:block">
            {date} · {session.activityType}
          </span>
        </span>
        <Stat value={hasDistance ? formatDistance(session.distanceM) : '—'} caption="distance" />
        <Stat value={time} caption="time" />
        <Stat value={pace ?? '—'} caption={paced ? 'pace' : 'speed'} />

        <ChevronDown
          className={cn(
            'text-muted-foreground size-4 shrink-0 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="bg-muted/30 border-t p-3.5 md:px-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {activityMetrics(session).map((m) => (
              <Metric key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
          {session.summaryPolyline ? (
            <div className="mt-3">
              <RouteMap polyline={session.summaryPolyline} className="h-72" />
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <a
              href={`https://www.strava.com/activities/${session.stravaActivityId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[#d15b28] hover:underline dark:text-[#ff7a3d]"
            >
              View on Strava ↗
            </a>
            <DeleteButton disabled={remove.isPending} onClick={() => void handleDelete()}>
              Remove
            </DeleteButton>
          </div>
        </div>
      )}
    </li>
  );
}
