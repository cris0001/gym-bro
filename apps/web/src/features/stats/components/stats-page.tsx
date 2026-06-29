import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ExerciseProgressChart } from './exercise-progress-chart';
import { ExerciseStatPicker } from './exercise-stat-picker';
import { RatingTrendChart } from './rating-trend-chart';

import type { StatExercise } from '@gym-bro/shared';

// Training stats: per-exercise progress (max weight / volume) and the workout
// rating trend, stacked in a single mobile-first column. The selected exercise
// lives here so the picker and progress chart stay in sync.
export function StatsPage() {
  const [exercise, setExercise] = useState<StatExercise | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Stats</h1>

      <Card>
        <CardHeader>
          <CardTitle>Exercise progress</CardTitle>
          <CardDescription>Max weight and total volume per session.</CardDescription>
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
  );
}
