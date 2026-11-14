import { format, parseISO } from 'date-fns';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

const SIZES = {
  // Desktop session side panel.
  md: { date: 'text-[11px]', pill: 'rounded-lg px-2 py-1 text-xs', gap: 'gap-1.5' },
  // Inline history (workout detail, the session card on phones).
  sm: { date: 'text-[10.5px]', pill: 'rounded-md px-1.5 py-0.5 text-[11px]', gap: 'gap-1' },
} as const;

// One past session of an exercise: its date, then the sets as pills — the top set
// tinted with ★, RIR as a small "@n" suffix, a null weight read as "BW". Shared by
// every exercise-history view so they all read the same way.
export function HistoryEntry({
  entry,
  size = 'md',
}: {
  entry: ExerciseHistoryEntry;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn('text-muted-foreground font-medium', s.date)}>
        {format(parseISO(entry.performedDate), 'EEE, MMM d')}
      </span>
      {entry.sets.length === 0 ? (
        <span className="text-muted-foreground text-xs">—</span>
      ) : (
        <ul className={cn('flex flex-wrap', s.gap)}>
          {entry.sets.map((set, i) => (
            <li
              key={i}
              className={cn(
                'font-semibold tabular-nums',
                s.pill,
                set.isTopSet ? 'bg-accent text-accent-foreground' : 'bg-secondary',
              )}
            >
              {set.isTopSet ? '★ ' : ''}
              {set.weight ?? 'BW'} × {set.reps ?? '–'}
              {set.rir !== null ? (
                <span className="text-muted-foreground ml-1 font-medium">@{set.rir}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
