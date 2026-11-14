import type { StravaSessionItem } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { formatDistance, formatDuration, formatElevation } from '../utils/format';
import { inRange, type Period, periodWindow } from '../utils/period';
import { summarize, weeklyVolume } from '../utils/stats';

const MICRO_LABEL = 'text-muted-foreground text-[10.5px] font-medium tracking-[0.08em] uppercase';

interface TileProps {
  label: string;
  value: string;
  // Signed change vs the comparison window, already formatted; null hides the line.
  delta: { text: string; up: boolean } | null;
}

function Tile({ label, value, delta }: TileProps) {
  return (
    <div className="bg-card rounded-xl border px-3.5 py-3">
      <p className={MICRO_LABEL}>{label}</p>
      <p className="font-heading mt-1 text-xl font-bold tabular-nums">{value}</p>
      {delta && (
        <p
          className={cn(
            'text-[11.5px] font-semibold',
            delta.up ? 'text-[#5a7a52] dark:text-[#8fae85]' : 'text-destructive',
          )}
        >
          {delta.text}
        </p>
      )}
    </div>
  );
}

// "+3 vs Oct" / "−1h 05m vs Oct"; null when there's nothing to compare against.
function deltaOf(now: number, before: number, fmt: (n: number) => string, label: string) {
  if (now === before) return null;
  const diff = now - before;
  return { text: `${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} vs ${label}`, up: diff > 0 };
}

// The Strava stats block (top of the page): totals for the period, vs the same span
// of the previous one, as 2×2 tiles beside (lg) / above the trailing 12-week volume
// bars (distance, or moving time for distance-less sports) with the current week
// highlighted. Lightweight CSS bars.
export function StravaStatsPanel({
  sessions,
  period,
}: {
  sessions: StravaSessionItem[];
  period: Period;
}) {
  const range = periodWindow(period);
  const totals = summarize(inRange(sessions, range.from));
  const prev = range.previous
    ? summarize(inRange(sessions, range.previous.from, range.previous.to))
    : null;
  const vs = (now: number, before: number | undefined, fmt: (n: number) => string) =>
    prev && range.previous && before !== undefined
      ? deltaOf(now, before, fmt, range.previous.label)
      : null;

  const hasDistance = sessions.some((s) => s.distanceM !== null && s.distanceM > 0);
  const weeks = weeklyVolume(sessions, (s) =>
    hasDistance ? (s.distanceM ?? 0) : (s.movingTimeS ?? 0),
  );
  const maxWeek = Math.max(...weeks.map((w) => w.value), 1);
  const fmtWeek = (v: number) => (hasDistance ? formatDistance(v) : formatDuration(v));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-2">
        <Tile
          label="Activities"
          value={String(totals.count)}
          delta={vs(totals.count, prev?.count, String)}
        />
        {hasDistance && (
          <Tile
            label="Distance"
            value={formatDistance(totals.distanceM)}
            delta={vs(totals.distanceM, prev?.distanceM, formatDistance)}
          />
        )}
        <Tile
          label="Moving time"
          value={formatDuration(totals.movingTimeS)}
          delta={vs(totals.movingTimeS, prev?.movingTimeS, formatDuration)}
        />
        <Tile
          label="Elevation"
          value={formatElevation(totals.elevationM)}
          delta={vs(totals.elevationM, prev?.elevationM, formatElevation)}
        />
      </div>

      <div className="bg-card flex flex-col gap-2.5 rounded-xl border px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <p className={MICRO_LABEL}>Weekly {hasDistance ? 'distance' : 'time'}</p>
          <span className="text-muted-foreground text-xs">12 weeks</span>
        </div>
        {/* Grows to match the tiles beside it on desktop. */}
        <div className="flex h-24 items-end gap-1 border-b lg:h-auto lg:min-h-24 lg:flex-1">
          {weeks.map((w, i) => (
            <div
              key={w.weekStart}
              className={cn(
                'flex-1 rounded-t',
                i === weeks.length - 1
                  ? 'bg-[#d15b28] dark:bg-[#ff7a3d]'
                  : 'bg-[#d15b28]/40 dark:bg-[#ff7a3d]/40',
              )}
              style={{ height: `${Math.max((w.value / maxWeek) * 100, 2)}%` }}
              title={`Week of ${w.label}: ${fmtWeek(w.value)}`}
            />
          ))}
        </div>
        <div className="text-faint-foreground flex justify-between text-[11px]">
          <span>{weeks[0]?.label}</span>
          <span>{weeks[Math.floor(weeks.length / 2)]?.label}</span>
          <span>This week</span>
        </div>
      </div>
    </div>
  );
}
