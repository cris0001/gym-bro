import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
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

// The two set tiers a session contributes: the marked top set vs the first normal
// (back-off) set.
type Dimension = 'top' | 'normal';

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'top', label: 'Top set' },
  { key: 'normal', label: 'Normal' },
];

interface ExerciseProgressChartProps {
  exerciseId: string | null;
}

// Per-session progress for the picked exercise: weight and reps plotted together
// (weight on the left axis, reps on the right — different scales), switchable
// between the top set and the normal (back-off) set. Normal is the default since
// most history's uniform back-off sets are the fuller series.
export function ExerciseProgressChart({ exerciseId }: ExerciseProgressChartProps) {
  const [dimension, setDimension] = useState<Dimension>('normal');
  const { data: points = [], isPending } = useExerciseProgress(exerciseId);

  if (exerciseId === null) {
    return <ChartPlaceholder>Select an exercise to see its progress.</ChartPlaceholder>;
  }
  if (isPending) {
    return <ChartPlaceholder>Loading…</ChartPlaceholder>;
  }

  const data = points.map((point) => ({
    date: point.date,
    weight: dimension === 'top' ? point.topWeight : point.normalWeight,
    reps: dimension === 'top' ? point.topReps : point.normalReps,
  }));
  const hasData = data.some((d) => d.weight !== null || d.reps !== null);
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
      <ToggleGroup options={DIMENSIONS} value={dimension} onChange={setDimension} />

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
              yAxisId="weight"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={44}
            />
            <YAxis
              yAxisId="reps"
              orientation="right"
              allowDecimals={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--card-foreground)',
              }}
              labelFormatter={(label) => format(parseISO(String(label)), 'PP')}
              formatter={(value, name) => {
                if (value === null || value === undefined) return ['—', name];
                return [name === 'Reps' ? `${String(value)} reps` : `${String(value)} kg`, name];
              }}
            />
            <Legend />
            <Line
              yAxisId="weight"
              name="Weight"
              type="monotone"
              dataKey="weight"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              yAxisId="reps"
              name="Reps"
              type="monotone"
              dataKey="reps"
              stroke="var(--chart-2)"
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
