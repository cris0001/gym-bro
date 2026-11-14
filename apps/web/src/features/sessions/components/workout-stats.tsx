import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { formatVolume } from '../utils/workout-totals';

interface WorkoutStatsProps {
  durationMinutes: number | null;
  // Lifted volume in kg; 0 (bodyweight-only or no sets) hides the stat.
  volume: number;
  sets: number;
  rating: number | null;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-[20px] leading-none tracking-[0.05em]">
      <span className="text-primary">{'★'.repeat(rating)}</span>
      <span className="text-border-strong">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function Value({ value, unit }: { value: ReactNode; unit?: string }) {
  return (
    <span className="font-heading text-[24px] leading-none font-bold tabular-nums">
      {value}
      {unit && (
        <span className="text-muted-foreground ml-1 font-sans text-[13px] font-medium">{unit}</span>
      )}
    </span>
  );
}

// A finished workout's headline numbers as tiles. Phones show only duration and
// rating (two per row); volume and sets join from sm, all four in one row. Stats with
// no value are dropped.
export function WorkoutStats({ durationMinutes, volume, sets, rating }: WorkoutStatsProps) {
  const t = useSessionsTranslation();
  const labels = t.workoutDetail.stats;
  const stats = [
    durationMinutes !== null && {
      key: 'duration',
      label: labels.duration,
      value: <Value value={durationMinutes} unit="min" />,
      desktopOnly: false,
    },
    volume > 0 && {
      key: 'volume',
      label: labels.volume,
      value: <Value value={formatVolume(volume)} unit="kg" />,
      desktopOnly: true,
    },
    sets > 0 && {
      key: 'sets',
      label: labels.sets,
      value: <Value value={sets} />,
      desktopOnly: true,
    },
    rating !== null && {
      key: 'rating',
      label: labels.rating,
      value: <RatingStars rating={rating} />,
      desktopOnly: false,
    },
  ].filter((stat) => stat !== false);

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={cn(
            'bg-card min-w-0 flex-col gap-2 rounded-xl border p-4',
            stat.desktopOnly ? 'hidden sm:flex' : 'flex',
          )}
        >
          <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
            {stat.label}
          </span>
          {stat.value}
        </div>
      ))}
    </div>
  );
}
