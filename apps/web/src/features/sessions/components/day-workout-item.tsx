import { Link } from '@tanstack/react-router';
import { Check, ChevronDown, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { WorkoutSessionDetail, WorkoutSessionListItem } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import { useDeleteWorkoutSession } from '../hooks/use-delete-workout-session';
import { useEditWorkout } from '../hooks/use-edit-workout';
import { useWorkoutSession } from '../hooks/use-workout-session';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// Five stars, filled up to `rating` (gold), the rest a warm empty tone.
function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="size-3"
          style={{
            fill: i <= rating ? '#d9a441' : '#e5d9c6',
            color: i <= rating ? '#d9a441' : '#e5d9c6',
          }}
        />
      ))}
    </span>
  );
}

// Total logged sets and lifted volume (kg × reps, bodyweight sets excluded) across a
// finished workout's performances.
function workoutTotals(detail: WorkoutSessionDetail): { sets: number; volume: number } {
  let sets = 0;
  let volume = 0;
  for (const performance of detail.performances) {
    for (const set of performance.sets) {
      sets += 1;
      if (set.weight !== null && set.reps !== null) volume += set.weight * set.reps;
    }
  }
  return { sets, volume };
}

// Long workouts collapse their exercise list behind a "+ N more" toggle.
const EXERCISE_PREVIEW = 4;

// One finished workout in the calendar day panel: a "✓ Finished" header with the serif
// name, rating and (once expanded) its totals, notes, and per-exercise set chips, plus
// Edit / Open / Delete. The full detail is fetched only when expanded; `defaultExpanded`
// opens it on mount (a day with a single finished workout shows straight away).
export function DayWorkoutItem({
  workout,
  defaultExpanded = false,
}: {
  workout: WorkoutSessionListItem;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const { data: detail, isLoading } = useWorkoutSession(workout.id, expanded);
  const editWorkout = useEditWorkout();
  const remove = useDeleteWorkoutSession();
  const confirm = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this workout?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(workout.id, { onSuccess: () => toast.success('Workout deleted') });
  }

  const totals = detail ? workoutTotals(detail) : null;
  const performances = detail?.performances ?? [];
  const visible = showAll ? performances : performances.slice(0, EXERCISE_PREVIEW);
  const hiddenCount = performances.length - visible.length;

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="hover:bg-muted/40 flex w-full items-start gap-2 p-3 text-left transition-colors"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8efe4] px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#5a7a52] uppercase dark:bg-[#2f3a2b] dark:text-[#8fae85]">
            <Check className="size-3" />
            Finished
          </span>
          <p className="font-heading mt-1 truncate text-[22px] leading-tight font-semibold">
            {workout.name}
          </p>
          <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs">
            {workout.durationMinutes !== null && <span>{workout.durationMinutes} min</span>}
            {totals && (
              <>
                <span>· {totals.sets} sets</span>
                {totals.volume > 0 && <span>· {fmt(totals.volume)} kg</span>}
              </>
            )}
            {workout.rating !== null && <Stars rating={workout.rating} />}
          </p>
        </div>
        {workout.tags.length > 0 && (
          <span className="mt-0.5 flex shrink-0 gap-1">
            {workout.tags.map((tag) => (
              <span
                key={tag.id}
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: tag.color }}
              />
            ))}
          </span>
        )}
        <ChevronDown
          className={cn(
            'text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border p-3">
          {isLoading || !detail ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : (
            <>
              {detail.notes !== null && (
                <p className="font-heading rounded-xl border border-[#f0e7d9] bg-[#fdfaf4] p-3 text-[13px] text-[#5c5044] italic dark:border-[#41362a] dark:bg-[#211a12] dark:text-[#c9bcab]">
                  “{detail.notes}”
                </p>
              )}

              {visible.map((performance) => {
                const topSet = performance.sets.find((s) => s.isTopSet && s.weight !== null);
                return (
                  <div key={performance.id} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-bold">
                        {performance.exercise.name}
                      </span>
                      {topSet && (
                        <span className="shrink-0 text-[10px] font-semibold tracking-wide text-[#d9a441] uppercase">
                          Top {topSet.weight} kg
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {performance.sets.map((set) => (
                        <span
                          key={set.id}
                          className={cn(
                            'rounded-lg px-[9px] py-1 text-[11px] font-bold',
                            set.isTopSet
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-secondary text-[#5c5044] dark:text-[#c9bcab]',
                          )}
                        >
                          {set.weight ?? 'BW'} × {set.reps ?? '—'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-muted-foreground flex items-center gap-1 self-start text-xs font-medium"
                >
                  + {hiddenCount} more exercise{hiddenCount === 1 ? '' : 's'}
                  <ChevronDown className="size-3.5" />
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {detail.sessionType === 'strength' && (
                  <Button
                    size="sm"
                    className="h-[34px] rounded-full"
                    onClick={() => void editWorkout(detail)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="bg-accent text-primary hover:bg-accent/70 h-[34px] rounded-full"
                >
                  <Link to="/history/$sessionId" params={{ sessionId: workout.id }}>
                    Open
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground ml-auto h-[34px] rounded-full"
                  onClick={() => void handleDelete()}
                  disabled={remove.isPending}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
