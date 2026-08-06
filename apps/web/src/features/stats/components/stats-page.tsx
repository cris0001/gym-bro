import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { StatsRange } from '../api/stats';
import { ExerciseProgressChart } from './exercise-progress-chart';
import { ExerciseStatPicker } from './exercise-stat-picker';
import { RatingTrendChart } from './rating-trend-chart';
import { StatsDateRange } from './stats-date-range';

import type { StatExercise } from '@gym-bro/shared';

// Training stats: per-exercise progress (top set vs normal set — weight + reps,
// over a selectable date window) and the workout rating trend. Side by side on
// desktop, stacked on mobile. The selected exercise and window live here so the
// picker, range control, and chart stay in sync.
export function StatsPage() {
  const [exercise, setExercise] = useState<StatExercise | null>(null);
  const [range, setRange] = useState<StatsRange | undefined>(undefined);

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <h1 className="font-heading text-[28px] leading-none font-medium">Stats</h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Exercise progress</CardTitle>
            <CardDescription className="font-heading text-[13px] italic">
              Top-set vs normal-set weight and reps.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ExerciseStatPicker value={exercise} onSelect={setExercise} />
            <StatsDateRange onChange={setRange} />
            <ExerciseProgressChart exerciseId={exercise?.id ?? null} range={range} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Workout ratings</CardTitle>
            <CardDescription className="font-heading text-[13px] italic">
              How you rated your sessions over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RatingTrendChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
