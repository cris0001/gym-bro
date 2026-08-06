import { startOfMonth, startOfYear } from 'date-fns';
import { useState } from 'react';

import type { StravaSessionItem } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { stravaActivityIcon } from '../utils/activity-icon';
import { formatDistance, formatDuration, formatElevation } from '../utils/format';
import { summarize, weeklyVolume } from '../utils/stats';

type Period = 'month' | 'year' | 'all';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All' },
];

function periodStart(period: Period): Date | null {
  const now = new Date();
  if (period === 'month') return startOfMonth(now);
  if (period === 'year') return startOfYear(now);
  return null;
}

// Distinct activity types present, most frequent first — the sport filter icons.
function distinctTypes(sessions: StravaSessionItem[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.activityType, (counts.get(s.activityType) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type);
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/60 rounded-xl p-3 text-center">
      <p className="font-heading text-lg font-semibold">{value}</p>
      <p className="text-muted-foreground text-[11px] tracking-[0.08em] uppercase">{label}</p>
    </div>
  );
}

// The dashboard header: a sport-type filter (icons), a period toggle, summary tiles,
// and a trailing weekly-distance bar chart — all scoped to the selected sport (null =
// all). The sport selection is owned by the page so it also filters the activity list.
// Lightweight CSS bars, no chart lib.
export function StravaSummary({
  sessions,
  type,
  onTypeChange,
}: {
  sessions: StravaSessionItem[];
  type: string | null;
  onTypeChange: (type: string | null) => void;
}) {
  const [period, setPeriod] = useState<Period>('month');

  const types = distinctTypes(sessions);
  const byType = type ? sessions.filter((s) => s.activityType === type) : sessions;

  const start = periodStart(period);
  const inPeriod = start ? byType.filter((s) => new Date(s.localDate) >= start) : byType;
  const totals = summarize(inPeriod);

  // Distance sports get a distance chart/tile; distance-less ones (yoga, strength,
  // physical therapy…) fall back to moving time.
  const hasDistance = byType.some((s) => s.distanceM !== null && s.distanceM > 0);
  const hasElevation = totals.elevationM > 0;
  const weeks = weeklyVolume(
    byType,
    (s) => (hasDistance ? (s.distanceM ?? 0) : (s.movingTimeS ?? 0)),
    12,
  );
  const maxWeek = Math.max(...weeks.map((w) => w.value), 1);
  const barTitle = (value: number) => (hasDistance ? formatDistance(value) : formatDuration(value));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
        {/* Sport filter — tap an icon to scope the dashboard to that activity type. */}
        {types.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTypeChange(null)}
              className={cn(
                'h-10 rounded-full px-3.5 text-sm font-medium transition-colors',
                type === null
                  ? 'bg-[#fbe3d4] text-[#c14e1d]'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              All
            </button>
            {types.map((t) => {
              const Icon = stravaActivityIcon(t);
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  title={t}
                  aria-label={t}
                  aria-pressed={active}
                  onClick={() => onTypeChange(active ? null : t)}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full transition-colors',
                    active ? 'bg-[#fbe3d4] text-[#c14e1d]' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        )}

        <div className="bg-secondary flex w-fit self-center rounded-full p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={cn(
                'h-7 rounded-full px-3 text-sm font-medium transition-colors',
                period === p.key ? 'bg-card text-foreground border' : 'text-muted-foreground',
              )}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile label="Activities" value={String(totals.count)} />
          {hasDistance && <Tile label="Distance" value={formatDistance(totals.distanceM)} />}
          <Tile label="Moving time" value={formatDuration(totals.movingTimeS)} />
          {hasElevation && <Tile label="Elevation" value={formatElevation(totals.elevationM)} />}
        </div>
      </div>

      <div className="bg-card flex flex-col gap-2 rounded-2xl border p-4">
        <p className="text-muted-foreground text-xs font-semibold uppercase">
          {type ? `${type} · ` : ''}weekly {hasDistance ? 'distance' : 'time'} · last 12 weeks
        </p>
        <div className="flex h-24 items-end gap-1">
          {weeks.map((w) => (
            <div
              key={w.weekStart}
              className="flex-1 rounded-t bg-[#d15b28]/70"
              style={{ height: `${Math.max((w.value / maxWeek) * 100, 2)}%` }}
              title={`Week of ${w.label}: ${barTitle(w.value)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
