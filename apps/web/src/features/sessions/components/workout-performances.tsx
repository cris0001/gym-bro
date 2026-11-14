import { History } from 'lucide-react';
import { useState } from 'react';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { ExerciseHistoryPanel } from './exercise-history-panel';
import { WorkoutNote } from './workout-note';
import { WorkoutPerformanceCard } from './workout-performance-card';

type Performance = WorkoutSessionDetail['performances'][number];

interface WorkoutPerformancesProps {
  performances: WorkoutSessionDetail['performances'];
  // Date of this workout, so each exercise's history excludes it.
  performedDate: string;
}

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// One workout's exercises. Phones: a card per exercise with the sets as tiles
// (WorkoutPerformanceCard). From md: rows in a single card — number, name + category
// (or what it was swapped from), the sets as "weight × reps" pills with the top set
// highlighted, the exercise's note, and a History icon toggle for past results.
export function WorkoutPerformances({ performances, performedDate }: WorkoutPerformancesProps) {
  const t = useSessionsTranslation();
  const label = t.workoutDetail.exercises(performances.length);
  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">
        <p className={cn(microLabel, 'mt-1')}>{label}</p>
        {performances.map((performance) => (
          <WorkoutPerformanceCard
            key={performance.id}
            performance={performance}
            performedDate={performedDate}
          />
        ))}
      </div>

      <section className="bg-card hidden rounded-xl border md:block">
        <p className={cn(microLabel, 'px-4 pt-4 pb-2')}>{label}</p>
        <ol>
          {performances.map((performance, index) => (
            <PerformanceRow
              key={performance.id}
              index={index}
              performance={performance}
              performedDate={performedDate}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

function PerformanceRow({
  index,
  performance,
  performedDate,
}: {
  index: number;
  performance: Performance;
  performedDate: string;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const t = useSessionsTranslation();
  const swapped = performance.exercise.id !== performance.originalExercise.id;

  return (
    <li className="border-border flex flex-col gap-2.5 border-t px-4 py-3.5">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5 md:grid-cols-[1.75rem_minmax(9rem,13rem)_minmax(0,1fr)_auto] md:items-center">
        <span className="bg-secondary text-muted-foreground flex size-7 items-center justify-center rounded-full text-xs font-bold">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-[15px] leading-tight font-semibold break-words">
            {performance.exercise.name}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {performance.exercise.category}
            {swapped ? t.workoutDetail.swappedFrom(performance.originalExercise.name) : ''}
          </p>
        </div>
        <ul className="col-start-2 flex flex-wrap gap-1.5 md:col-start-3">
          {performance.sets.map((set) => (
            <li
              key={set.id}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[13px] font-semibold tabular-nums',
                set.isTopSet ? 'bg-accent text-accent-foreground' : 'bg-secondary',
              )}
            >
              {set.isTopSet ? '★ ' : ''}
              {set.weight ?? 'BW'} × {set.reps ?? '–'}
              {set.rir !== null && set.rir !== undefined ? (
                <span className="text-muted-foreground ml-1 text-[11px] font-medium">
                  RIR {set.rir}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {/* Phones: icon + label (an icon alone is easy to miss). From md: a round icon
            button at the row's end, tinted while the history is open. */}
        <button
          type="button"
          aria-expanded={showHistory}
          aria-label={showHistory ? t.workoutDetail.hideHistory : t.workoutDetail.history}
          title={showHistory ? t.workoutDetail.hideHistory : t.workoutDetail.history}
          onClick={() => setShowHistory((value) => !value)}
          className={cn(
            'text-primary col-start-2 inline-flex h-8 w-fit items-center gap-1.5 rounded-full text-xs font-semibold transition-colors md:col-start-4 md:size-9 md:justify-center md:gap-0',
            showHistory
              ? 'md:bg-accent'
              : 'md:text-muted-foreground md:hover:bg-muted md:hover:text-foreground',
          )}
        >
          <History className="size-4" />
          <span className="md:sr-only">
            {showHistory ? t.workoutDetail.hideHistory : t.workoutDetail.history}
          </span>
        </button>
      </div>

      {performance.notes !== null && (
        <div className="md:pl-10">
          <WorkoutNote note={performance.notes} compact />
        </div>
      )}
      {showHistory && (
        <div className="md:pl-10">
          <ExerciseHistoryPanel exerciseId={performance.exercise.id} before={performedDate} />
        </div>
      )}
    </li>
  );
}
