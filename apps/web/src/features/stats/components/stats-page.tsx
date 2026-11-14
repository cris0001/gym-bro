import { useState } from 'react';

import type { StatExercise } from '@gym-bro/shared';

import { PageTitle } from '@/components/page-title';
import { cn } from '@/lib/utils';

import type { StatsRange } from '../api/stats';
import { ExerciseProgressChart } from './exercise-progress-chart';
import { ExerciseStatPicker } from './exercise-stat-picker';
import { RatingSummaryCard } from './rating-summary';
import { StatsDateRange } from './stats-date-range';
import { StatsOverviewTiles } from './stats-overview-tiles';

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// Training stats: a row of this-month tiles, then per-exercise progress (wide, with
// its exercise + period pickers and headline numbers) beside the workout-rating
// summary. Stacked on phones. The selected exercise and window live here so the
// pickers and the chart stay in sync.
export function StatsPage() {
  const [exercise, setExercise] = useState<StatExercise | null>(null);
  const [range, setRange] = useState<StatsRange | undefined>(undefined);

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
        Stats
      </PageTitle>

      <StatsOverviewTiles />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <section className="bg-card flex min-w-0 flex-col gap-4 rounded-xl border p-5">
          <p className={cn(microLabel, 'lg:hidden')}>Exercise progress</p>
          {/* Period on the left, exercise on the right (stacked on phones). */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <StatsDateRange onChange={setRange} className="w-full sm:w-auto" />
            <ExerciseStatPicker value={exercise} onSelect={setExercise} />
          </div>
          <ExerciseProgressChart exerciseId={exercise?.id ?? null} range={range} />
        </section>

        <section className="bg-card flex flex-col gap-4 rounded-xl border p-5">
          <p className={cn(microLabel, 'lg:hidden')}>Workout ratings</p>
          <RatingSummaryCard />
        </section>
      </div>
    </div>
  );
}
