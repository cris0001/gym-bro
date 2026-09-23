import { Link } from '@tanstack/react-router';
import { Check, ChevronDown, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { WorkoutSessionDetail, WorkoutSessionListItem } from '@gym-bro/shared';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EditIconButton } from '@/components/edit-icon-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import { useSessionsTranslation } from '../i18n';
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
            fill: i <= rating ? '#d9a441' : '#e4dad2',
            color: i <= rating ? '#d9a441' : '#e4dad2',
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
  const t = useSessionsTranslation();

  async function handleDelete() {
    const ok = await confirm({
      title: t.common.deleteWorkoutConfirm.title,
      description: t.common.deleteWorkoutConfirm.description,
      confirmText: t.common.deleteWorkoutConfirm.confirmText,
      destructive: true,
    });
    if (ok) remove.mutate(workout.id, { onSuccess: () => toast.success(t.common.workoutDeleted) });
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
        className="hover:bg-muted/40 flex w-full items-center gap-3 p-3 text-left transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8efe4] text-[#5a7a52] dark:bg-[#2f3a2b] dark:text-[#8fae85]">
          <Check className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading truncate text-lg leading-tight font-semibold">
            {workout.name}
          </p>
          <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs">
            {workout.durationMinutes !== null && <span>{workout.durationMinutes} min</span>}
            {totals && (
              <>
                {workout.durationMinutes !== null && <span>·</span>}
                <span>{t.dayWorkout.sets(totals.sets)}</span>
                {totals.volume > 0 && <span>· {fmt(totals.volume)} kg</span>}
              </>
            )}
            {workout.rating !== null && <Stars rating={workout.rating} />}
          </p>
        </div>
        {workout.tags.length > 0 && (
          <span className="flex shrink-0 gap-1">
            {workout.tags.map((tag) => (
              <span
                key={tag.id}
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: tag.color }}
              />
            ))}
          </span>
        )}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8efe4] px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#5a7a52] uppercase dark:bg-[#2f3a2b] dark:text-[#8fae85]">
          {t.dayWorkout.finished}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground size-4 shrink-0 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border p-3">
          {isLoading || !detail ? (
            <p className="text-muted-foreground text-sm">{t.common.loading}</p>
          ) : (
            <>
              {detail.notes !== null && (
                <p className="font-heading rounded-xl border border-[#efe8e2] bg-[#fdfbf9] p-3 text-[13px] text-[#574c52] italic dark:border-[#40353c] dark:bg-[#221a20] dark:text-[#c6b8bd]">
                  “{detail.notes}”
                </p>
              )}

              {visible.map((performance) => {
                const topSet = performance.sets.find((s) => s.isTopSet && s.weight !== null);
                return (
                  <div key={performance.id} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-heading truncate text-[15px] font-semibold">
                        {performance.exercise.name}
                      </span>
                      {topSet && (
                        <span className="shrink-0 text-[11px] font-semibold text-[#75394c] dark:text-[#c98fa0]">
                          ★ {t.dayWorkout.top(topSet.weight ?? 'BW')}
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
                              ? 'bg-[#f5e7ea] text-[#75394c] dark:bg-[#3a2f34] dark:text-[#e8cdd5]'
                              : 'bg-[#f0e9e3] text-[#574c52] dark:bg-[#2a2228] dark:text-[#c6b8bd]',
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
                  {t.dayWorkout.moreExercises(hiddenCount)}
                  <ChevronDown className="size-3.5" />
                </button>
              )}

              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Button asChild className="h-11 flex-1 rounded-full">
                  <Link to="/history/$sessionId" params={{ sessionId: workout.id }}>
                    {t.dayWorkout.open}
                  </Link>
                </Button>
                {detail.sessionType === 'strength' && (
                  <EditIconButton
                    aria-label={t.common.edit}
                    onClick={() => void editWorkout(detail)}
                  />
                )}
                <DeleteIconButton
                  aria-label={t.common.delete}
                  onClick={() => void handleDelete()}
                  disabled={remove.isPending}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
