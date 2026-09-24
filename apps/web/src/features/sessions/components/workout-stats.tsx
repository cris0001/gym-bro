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
  // 'bar' = the mobile 3-up strip (no sets); 'list' = the desktop sidebar rows.
  variant: 'bar' | 'list';
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-[17px] leading-none tracking-[0.05em]">
      <span className="text-primary">{'★'.repeat(rating)}</span>
      <span className="text-border-strong">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function Value({ value, unit }: { value: ReactNode; unit?: string }) {
  return (
    <span className="font-heading text-[20px] leading-none font-semibold">
      {value}
      {unit && (
        <span className="text-muted-foreground ml-1 font-sans text-[11.5px] font-medium">
          {unit}
        </span>
      )}
    </span>
  );
}

const LABEL = 'text-muted-foreground text-[10.5px] font-bold tracking-[0.08em] uppercase';

// A finished workout's headline numbers. Stats with no value are dropped, and the
// mobile bar's columns shrink to match.
export function WorkoutStats({
  durationMinutes,
  volume,
  sets,
  rating,
  variant,
}: WorkoutStatsProps) {
  const t = useSessionsTranslation();
  const labels = t.workoutDetail.stats;
  const stats = [
    durationMinutes !== null && {
      key: 'duration',
      label: labels.duration,
      value: <Value value={durationMinutes} unit="min" />,
    },
    volume > 0 && {
      key: 'volume',
      label: labels.volume,
      value: <Value value={formatVolume(volume)} unit="kg" />,
    },
    variant === 'list' &&
      sets > 0 && { key: 'sets', label: labels.sets, value: <Value value={sets} /> },
    rating !== null && {
      key: 'rating',
      label: labels.rating,
      value: <RatingStars rating={rating} />,
    },
  ].filter((stat) => stat !== false);

  if (stats.length === 0) return null;

  if (variant === 'list') {
    return (
      <div className="bg-card rounded-[18px] border px-[18px] py-1.5">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="border-border-strong/60 flex items-center justify-between gap-3 border-b border-dashed py-3 last:border-b-0"
          >
            <span className={LABEL}>{stat.label}</span>
            {stat.value}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card divide-border grid divide-x overflow-hidden rounded-[18px] border',
        stats.length === 3 ? 'grid-cols-3' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1',
      )}
    >
      {stats.map((stat) => (
        <div key={stat.key} className="flex min-w-0 flex-col gap-1.5 p-3">
          <span className={LABEL}>{stat.label}</span>
          {stat.value}
        </div>
      ))}
    </div>
  );
}
