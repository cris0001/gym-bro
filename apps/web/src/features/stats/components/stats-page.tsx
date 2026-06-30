import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ExerciseProgressChart } from './exercise-progress-chart';
import { ExerciseStatPicker } from './exercise-stat-picker';
import { RatingTrendChart } from './rating-trend-chart';

import type { StatExercise } from '@gym-bro/shared';

// Training stats: per-exercise progress (top set vs normal set — weight, reps, or
// volume) and the workout rating trend. Side by side on desktop, stacked on
// mobile. The selected exercise lives here so the picker and chart stay in sync.
export function StatsPage() {
  const [exercise, setExercise] = useState<StatExercise | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Exercise progress</CardTitle>
            <CardDescription>Top-set vs normal-set, by weight, reps, or volume.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ExerciseStatPicker value={exercise} onSelect={setExercise} />
            <ExerciseProgressChart exerciseId={exercise?.id ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout ratings</CardTitle>
            <CardDescription>How you rated your sessions over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <RatingTrendChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
