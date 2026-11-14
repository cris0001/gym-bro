import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

import { useWorkoutsInRange } from '@/features/sessions';
import { useStravaSessions } from '@/features/strava';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ISO = 'yyyy-MM-dd';

interface Tile {
  key: string;
  label: string;
  value: string;
  unit?: string;
  sub: string;
  tone?: 'up' | 'down';
  // Hidden on phones, which keep only workouts + Strava.
  desktopOnly?: boolean;
}

// "+3 vs last month" style comparison line for a count.
function versus(current: number, previous: number): Pick<Tile, 'sub' | 'tone'> {
  const diff = current - previous;
  if (diff === 0) return { sub: 'same as last month' };
  return { sub: `${diff > 0 ? '+' : ''}${diff} vs last month`, tone: diff > 0 ? 'up' : 'down' };
}

// The stats page's headline row: this month's strength workouts and Strava
// activities (each against last month) and the average workout length. Phones show
// just the first two; from md all three sit in one row.
export function StatsOverviewTiles() {
  const now = new Date();
  const month = { from: format(startOfMonth(now), ISO), to: format(endOfMonth(now), ISO) };
  const prev = subMonths(now, 1);
  const lastMonth = { from: format(startOfMonth(prev), ISO), to: format(endOfMonth(prev), ISO) };

  const { data: thisPage, isPending: thisPending } = useWorkoutsInRange(month.from, month.to);
  const { data: lastPage, isPending: lastPending } = useWorkoutsInRange(
    lastMonth.from,
    lastMonth.to,
  );
  const { data: strava = [], isPending: stravaPending } = useStravaSessions();
  // Until the counts arrive, show placeholders rather than a misleading "0".
  const loading = thisPending || lastPending || stravaPending;

  const strength = (thisPage?.items ?? []).filter((s) => s.sessionType === 'strength');
  const lastStrength = (lastPage?.items ?? []).filter((s) => s.sessionType === 'strength');
  const stravaThis = strava.filter((s) => s.localDate.startsWith(month.from.slice(0, 7)));
  const stravaLast = strava.filter((s) => s.localDate.startsWith(lastMonth.from.slice(0, 7)));
  const durations = strength.map((s) => s.durationMinutes).filter((d): d is number => d !== null);
  const avgMinutes =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  const tiles: Tile[] = [
    {
      key: 'workouts',
      label: 'Workouts',
      value: String(strength.length),
      unit: ' this month',
      ...versus(strength.length, lastStrength.length),
    },
    {
      key: 'strava',
      label: 'Strava',
      value: String(stravaThis.length),
      unit: stravaThis.length === 1 ? ' activity' : ' activities',
      ...versus(stravaThis.length, stravaLast.length),
    },
    {
      key: 'duration',
      desktopOnly: true,
      label: 'Avg workout',
      value: avgMinutes === null ? '—' : String(avgMinutes),
      unit: avgMinutes === null ? '' : ' min',
      sub: 'this month',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className={cn(
            'bg-card min-w-0 flex-col gap-1 rounded-xl border p-4',
            tile.desktopOnly ? 'hidden md:flex' : 'flex',
          )}
        >
          <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
            {tile.label}
          </span>
          {loading ? (
            // Same line boxes as the real value (text-2xl, leading-tight) and sub line.
            <>
              <div className="flex h-[30px] items-center">
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex h-4 items-center">
                <Skeleton className="h-3 w-24" />
              </div>
            </>
          ) : (
            <>
              <span className="font-heading truncate text-2xl leading-tight font-bold tabular-nums">
                {tile.value}
                <span className="text-muted-foreground text-[13px] font-medium">{tile.unit}</span>
              </span>
              <span
                className={cn(
                  'truncate text-xs font-semibold',
                  tile.tone === 'up'
                    ? 'text-[#4a6943] dark:text-[#8fae85]'
                    : tile.tone === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground font-medium',
                )}
              >
                {tile.sub}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
