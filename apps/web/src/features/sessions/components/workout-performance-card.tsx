import { History } from 'lucide-react';
import { useState } from 'react';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { ExerciseHistoryPanel } from './exercise-history-panel';
import { WorkoutNote } from './workout-note';

type Performance = WorkoutSessionDetail['performances'][number];

// The phone layout of one exercise on the workout detail: its own card with name,
// category, the sets as tiles four to a row, three under 360px (weight large, reps +
// RIR beneath, the top set tinted), its note, and a History toggle (bottom right) that
// opens past results under the card.
export function WorkoutPerformanceCard({
  performance,
  performedDate,
}: {
  performance: Performance;
  performedDate: string;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const t = useSessionsTranslation();
  const swapped = performance.exercise.id !== performance.originalExercise.id;

  return (
    <section className="bg-card flex flex-col gap-3 rounded-xl border p-3.5">
      <div className="min-w-0">
        <p className="text-base leading-tight font-semibold break-words">
          {performance.exercise.name}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {performance.exercise.category}
          {swapped ? t.workoutDetail.swappedFrom(performance.originalExercise.name) : ''}
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-1.5 min-[360px]:grid-cols-4">
        {performance.sets.map((set) => (
          <li
            key={set.id}
            className={cn(
              'flex flex-col items-center rounded-lg px-1 py-2 text-center',
              set.isTopSet ? 'bg-accent text-accent-foreground' : 'bg-secondary',
            )}
          >
            <span className="font-heading text-[15px] leading-tight font-bold tabular-nums">
              {set.isTopSet ? '★ ' : ''}
              {set.weight ?? 'BW'}
            </span>
            <span className="text-[11px] font-medium opacity-80">
              {set.reps ?? '–'} {t.common.reps.toLowerCase()}
              {set.rir !== null && set.rir !== undefined ? ` · RIR ${set.rir}` : ''}
            </span>
          </li>
        ))}
      </ul>

      {performance.notes !== null && <WorkoutNote note={performance.notes} compact />}

      <button
        type="button"
        aria-expanded={showHistory}
        onClick={() => setShowHistory((value) => !value)}
        className={cn(
          'text-primary -mr-1 -mb-1 inline-flex h-9 items-center gap-1.5 self-end rounded-full px-2.5 text-xs font-semibold transition-colors',
          showHistory && 'bg-accent',
        )}
      >
        <History className="size-4" />
        {showHistory ? t.workoutDetail.hideHistory : t.workoutDetail.history}
      </button>
      {showHistory && (
        <ExerciseHistoryPanel exerciseId={performance.exercise.id} before={performedDate} />
      )}
    </section>
  );
}
