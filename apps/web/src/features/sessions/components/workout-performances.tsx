import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { formatVolume, performanceVolume } from '../utils/workout-totals';
import { ExerciseHistoryPanel } from './exercise-history-panel';

const cell = (value: number | null): string => (value === null ? '—' : String(value));
const COLS = 'grid grid-cols-3 text-center';

interface WorkoutPerformancesProps {
  performances: WorkoutSessionDetail['performances'];
  // Date of this workout, so each exercise's "Previous" panel excludes it.
  performedDate: string;
  // The per-exercise "Previous" panel is useful on the full detail page but noisy
  // in compact contexts, so it can be turned off.
  showPrevious?: boolean;
  className?: string;
}

// One workout's exercises as cards: name + category/sets (or what it was swapped
// from) with the exercise volume, its note, a KG · REPS · RIR table where only the
// top set is highlighted, and the "Previous" strip. A null weight reads "BW".
export function WorkoutPerformances({
  performances,
  performedDate,
  showPrevious = true,
  className,
}: WorkoutPerformancesProps) {
  const t = useSessionsTranslation();
  return (
    <div className={cn('grid gap-3.5', className)}>
      {performances.map((performance) => {
        const swapped = performance.exercise.id !== performance.originalExercise.id;
        const volume = performanceVolume(performance);
        return (
          <div
            key={performance.id}
            className="bg-card flex min-w-0 flex-col gap-2.5 rounded-[20px] border px-3.5 pt-3.5 pb-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-heading text-[17px] leading-tight font-semibold break-words">
                  {performance.exercise.name}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11.5px]">
                  {performance.exercise.category}
                  {swapped
                    ? t.workoutDetail.swappedFrom(performance.originalExercise.name)
                    : ` · ${t.dayWorkout.sets(performance.sets.length)}`}
                </p>
              </div>
              <span className="text-muted-foreground mt-1 shrink-0 text-[11.5px] font-semibold">
                {volume > 0 ? `${formatVolume(volume)} kg` : 'BW'}
              </span>
            </div>

            {performance.notes !== null && (
              <p className="text-subtle-foreground text-[12.5px] break-words whitespace-pre-line">
                {performance.notes}
              </p>
            )}

            <div className="border-border border-t pt-2">
              <div
                className={cn(
                  COLS,
                  'text-muted-foreground pb-1 text-[10.5px] font-bold tracking-[0.08em] uppercase',
                )}
              >
                <span>kg</span>
                <span>{t.common.reps}</span>
                <span>{t.common.rir}</span>
              </div>
              {performance.sets.map((set) => (
                <div
                  key={set.id}
                  className={cn(
                    COLS,
                    'relative items-center rounded-[10px] py-1.5',
                    set.isTopSet && 'bg-accent text-accent-foreground',
                  )}
                >
                  {/* Pinned to the row's left edge so the weight column stays centered. */}
                  {set.isTopSet && (
                    <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[16px] leading-none">
                      ★
                    </span>
                  )}
                  <span className="font-heading text-[16px] font-semibold">
                    {set.weight ?? 'BW'}
                  </span>
                  <span className="font-heading text-[16px] font-semibold">{cell(set.reps)}</span>
                  <span className="font-heading text-muted-foreground text-[15px]">
                    {cell(set.rir)}
                  </span>
                </div>
              ))}
            </div>

            {showPrevious && (
              <ExerciseHistoryPanel exerciseId={performance.exercise.id} before={performedDate} />
            )}
          </div>
        );
      })}
    </div>
  );
}
