import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useExerciseProgress } from '../hooks/use-stats';

import { ChartPlaceholder } from './chart-placeholder';

import type { ExerciseProgressPoint } from '@gym-bro/shared';

// The two set tiers a session contributes: the marked top set vs the first normal
// (back-off) set.
type Dimension = 'top' | 'normal';
type Metric = 'weight' | 'reps' | 'volume';

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'top', label: 'Top set' },
  { key: 'normal', label: 'Normal' },
];
const METRICS: { key: Metric; label: string }[] = [
  { key: 'weight', label: 'Weight' },
  { key: 'reps', label: 'Reps' },
  { key: 'volume', label: 'Volume' },
];
const METRIC_UNIT: Record<Metric, string> = { weight: 'kg', reps: 'reps', volume: 'kg·reps' };

// The metric value for a point given the chosen tier; volume is weight × reps.
// Null (bodyweight weight, or a tier not logged that session) leaves a gap.
function valueOf(
  point: ExerciseProgressPoint,
  dimension: Dimension,
  metric: Metric,
): number | null {
  const weight = dimension === 'top' ? point.topWeight : point.normalWeight;
  const reps = dimension === 'top' ? point.topReps : point.normalReps;
  if (metric === 'weight') return weight;
  if (metric === 'reps') return reps;
  return weight !== null && reps !== null ? weight * reps : null;
}

interface ExerciseProgressChartProps {
  exerciseId: string | null;
}

// Per-session progress for the picked exercise: switch between the top set and the
// normal (back-off) set, and between weight / reps / volume.
export function ExerciseProgressChart({ exerciseId }: ExerciseProgressChartProps) {
  // Default to normal sets: most logged history has no marked top set, so the top
  // view would look empty even when the exercise has plenty of data.
  const [dimension, setDimension] = useState<Dimension>('normal');
  const [metric, setMetric] = useState<Metric>('weight');
  const { data: points = [], isPending } = useExerciseProgress(exerciseId);

  if (exerciseId === null) {
    return <ChartPlaceholder>Select an exercise to see its progress.</ChartPlaceholder>;
  }
  if (isPending) {
    return <ChartPlaceholder>Loading…</ChartPlaceholder>;
  }

  const data = points.map((point) => ({
    date: point.date,
    value: valueOf(point, dimension, metric),
  }));
  const hasData = data.some((d) => d.value !== null);
  if (!hasData) {
    return (
      <ChartPlaceholder>
        No {DIMENSIONS.find((d) => d.key === dimension)?.label.toLowerCase()} data for this exercise
        yet.
      </ChartPlaceholder>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <ToggleGroup options={DIMENSIONS} value={dimension} onChange={setDimension} />
        <ToggleGroup options={METRICS} value={metric} onChange={setMetric} />
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={44}
              allowDecimals={metric === 'weight'}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--card-foreground)',
              }}
              labelFormatter={(label) => format(parseISO(String(label)), 'PP')}
              formatter={(value) => `${String(value)} ${METRIC_UNIT[metric]}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// A segmented toggle over a list of {key,label} options.
function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="bg-muted flex w-fit gap-1 rounded-md p-1">
      {options.map((option) => (
        <Button
          key={option.key}
          type="button"
          size="sm"
          variant={value === option.key ? 'default' : 'ghost'}
          className={cn('h-8', value !== option.key && 'text-muted-foreground')}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
