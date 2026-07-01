import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
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

import type { StatsRange } from '../api/stats';
import { useExerciseProgress } from '../hooks/use-stats';

import { ChartPlaceholder } from './chart-placeholder';

// The two set tiers a session contributes: the marked top set vs the first normal
// (back-off) set.
type Dimension = 'top' | 'normal';

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'top', label: 'Top set' },
  { key: 'normal', label: 'Normal' },
];

// Expand an axis a fixed amount beyond its data so the lines don't touch the top /
// bottom edges. Null values (bodyweight, or a tier not logged) are ignored.
function paddedDomain(values: (number | null)[], pad: number): [number, number] | undefined {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return undefined;
  return [Math.max(0, Math.floor(Math.min(...nums) - pad)), Math.ceil(Math.max(...nums) + pad)];
}

interface ExerciseProgressChartProps {
  exerciseId: string | null;
  range?: StatsRange | undefined;
}

// Per-session progress for the picked exercise: weight and reps plotted together
// (weight on the left axis, reps on the right — different scales), switchable
// between the top set and the normal (back-off) set. Normal is the default since
// most history's uniform back-off sets are the fuller series.
export function ExerciseProgressChart({ exerciseId, range }: ExerciseProgressChartProps) {
  const [dimension, setDimension] = useState<Dimension>('normal');
  const { data: points = [], isPending } = useExerciseProgress(exerciseId, range);

  // Reset to the normal (back-off) set whenever a different exercise is picked —
  // it's the fuller series, so it's the sensible default on each new selection.
  useEffect(() => {
    setDimension('normal');
  }, [exerciseId]);

  if (exerciseId === null) {
    return <ChartPlaceholder>Select an exercise to see its progress.</ChartPlaceholder>;
  }
  if (isPending) {
    return <ChartPlaceholder>Loading…</ChartPlaceholder>;
  }

  const data = points.map((point) => ({
    date: point.date,
    weight: dimension === 'top' ? point.topWeight : point.normalWeight,
    // Kept off the chart (a second line read weird) but surfaced in the tooltip.
    reps: dimension === 'top' ? point.topReps : point.normalReps,
  }));
  const weightDomain = paddedDomain(
    data.map((d) => d.weight),
    3,
  );
  const hasData = data.some((d) => d.weight !== null);
  const dimensionLabel = DIMENSIONS.find((d) => d.key === dimension)?.label.toLowerCase();

  // The Top/Normal switch stays mounted even with no data for the chosen tier, so
  // you can always switch back (e.g. from an empty Top set to Normal).
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup options={DIMENSIONS} value={dimension} onChange={setDimension} />

      {!hasData ? (
        <ChartPlaceholder>No {dimensionLabel} data for this exercise yet.</ChartPlaceholder>
      ) : (
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
                domain={weightDomain ?? ['auto', 'auto']}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                width={44}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]!.payload as { weight: number | null; reps: number | null };
                  const weight = row.weight === null ? 'BW' : `${row.weight} kg`;
                  return (
                    <div className="bg-card text-card-foreground rounded-lg border px-3 py-2 text-sm shadow-sm">
                      <p className="mb-0.5 font-medium">{format(parseISO(String(label)), 'PP')}</p>
                      <p>
                        {weight}
                        {row.reps !== null ? ` · ${row.reps} reps` : ''}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
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
