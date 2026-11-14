import { useState } from 'react';

import type { StravaSessionItem } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { SPORT_GROUP_LABEL, sportGroup, type SportGroup } from '../utils/sport-group';
import { weeklyVolume } from '../utils/stats';

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';
const WEEKS = 8;

// The dashboard's weekly-volume card beside the last activity: one sport's distance per
// week over the last 8 weeks (moving time when that sport has no distance, e.g. only
// virtual rides). Defaults to the last activity's sport; pills switch between the
// sports present. Plain div bars — Recharts would be heavy for eight columns.
export function StravaWeeklyCard({ sessions }: { sessions: StravaSessionItem[] }) {
  const latest = sessions[0];
  const [picked, setPicked] = useState<SportGroup | null>(null);
  if (!latest) return null;

  const groups = [...new Set(sessions.map((s) => sportGroup(s.activityType)))];
  const group = picked ?? sportGroup(latest.activityType);
  const inGroup = sessions.filter((s) => sportGroup(s.activityType) === group);

  const byDistance = weeklyVolume(inGroup, (s) => (s.distanceM ?? 0) / 1000, WEEKS);
  const useDistance = byDistance.some((week) => week.value > 0);
  const weeks = useDistance
    ? byDistance
    : weeklyVolume(inGroup, (s) => (s.movingTimeS ?? 0) / 3600, WEEKS);
  const unit = useDistance ? 'km' : 'h';
  const max = Math.max(...weeks.map((week) => week.value), 0);
  const total = weeks.reduce((sum, week) => sum + week.value, 0);
  const thisWeek = weeks[weeks.length - 1]?.value ?? 0;

  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={microLabel}>Last {WEEKS} weeks</p>
        {groups.length > 1 ? (
          <div className="flex flex-wrap gap-1">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={g === group}
                onClick={() => setPicked(g)}
                className={cn(
                  'h-8 rounded-full px-3 text-xs font-semibold transition-colors',
                  g === group
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {SPORT_GROUP_LABEL[g]}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="font-heading text-lg leading-tight font-bold tabular-nums">
        {total.toFixed(1)} {unit}
        <span className="text-muted-foreground ml-1.5 text-[13px] font-normal">
          {SPORT_GROUP_LABEL[group].toLowerCase()}
        </span>
      </p>
      <div className="mt-auto grid h-24 grid-cols-8 items-end gap-2" aria-hidden>
        {weeks.map((week, i) => (
          <div
            key={week.weekStart}
            className={cn('rounded-sm', i === weeks.length - 1 ? 'bg-primary' : 'bg-primary/25')}
            style={{ height: max > 0 ? `${Math.max(4, (week.value / max) * 100)}%` : '4%' }}
            title={`${week.label}: ${week.value.toFixed(1)} ${unit}`}
          />
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between text-[11px]">
        <span>{weeks[0]?.label}</span>
        <span>
          This week · {thisWeek.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
}
