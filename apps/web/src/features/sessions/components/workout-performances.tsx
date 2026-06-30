import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { ExerciseHistoryPanel } from './exercise-history-panel';

const cell = (value: number | null): string => (value === null ? '—' : String(value));

interface WorkoutPerformancesProps {
  performances: WorkoutSessionDetail['performances'];
  // Date of this workout, so each exercise's "Previous" panel excludes it.
  performedDate: string;
  // The per-exercise "Previous" panel is useful on the full detail page but noisy
  // in the compact calendar panel, so it can be turned off.
  showPrevious?: boolean;
}

// One workout's exercises and their logged sets. A swapped exercise notes what it
// replaced; the top set fills its index badge and a null weight reads "BW".
// Shared by the full-page detail and the calendar day panel.
export function WorkoutPerformances({
  performances,
  performedDate,
  showPrevious = true,
}: WorkoutPerformancesProps) {
  return (
    <div className="flex flex-col gap-3">
      {performances.map((performance) => {
        const swapped = performance.exercise.id !== performance.originalExercise.id;
        return (
          <div key={performance.id} className="bg-card flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex flex-col">
              <span className="font-semibold">{performance.exercise.name}</span>
              <span className="text-muted-foreground text-xs">
                {performance.exercise.category}
                {swapped && ` · swapped from ${performance.originalExercise.name}`}
              </span>
            </div>
            {performance.notes !== null && (
              <p className="text-muted-foreground text-sm">{performance.notes}</p>
            )}
            <div className="text-muted-foreground grid grid-cols-[1.5rem_1fr_1fr_1fr] gap-2 text-center text-xs font-medium">
              <span>#</span>
              <span>Weight</span>
              <span>Reps</span>
              <span>RIR</span>
            </div>
            {performance.sets.map((set, index) => (
              <div
                key={set.id}
                className="grid grid-cols-[1.5rem_1fr_1fr_1fr] items-center gap-2 text-center text-sm"
              >
                <span
                  className={cn(
                    'mx-auto flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    set.isTopSet ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {index + 1}
                </span>
                {/* A null weight on a finished set means it was bodyweight. */}
                <span>{set.weight ?? 'BW'}</span>
                <span>{cell(set.reps)}</span>
                <span>{cell(set.rir)}</span>
              </div>
            ))}
            {showPrevious && (
              <ExerciseHistoryPanel exerciseId={performance.exercise.id} before={performedDate} />
            )}
          </div>
        );
      })}
    </div>
  );
}
