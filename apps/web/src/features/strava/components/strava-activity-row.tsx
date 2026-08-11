import { format, parseISO } from 'date-fns';
import { ChevronDown, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { StravaSessionItem } from '@gym-bro/shared';

import { useDeleteStravaSession } from '../hooks/use-delete-strava-session';
import { stravaActivityIcon } from '../utils/activity-icon';
import { formatDistance, formatDuration } from '../utils/format';
import { activityMetrics } from '../utils/metrics';
import { RouteMap } from './route-map';

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
  const primary =
    session.distanceM !== null
      ? formatDistance(session.distanceM)
      : formatDuration(session.movingTimeS);

  return (
    <li id={`strava-activity-${session.id}`} className="bg-card overflow-hidden rounded-2xl border">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/50 active:bg-muted flex w-full items-center gap-3 p-3 text-left transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fbe3d4] text-[#d15b28] dark:bg-[#45291b] dark:text-[#ff7a3d]">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{session.name}</span>
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive gap-1.5"
              disabled={remove.isPending}
              onClick={() => void handleDelete()}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
