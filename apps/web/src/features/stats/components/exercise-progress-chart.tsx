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

type Metric = 'weight' | 'volume';

// The two progress metrics share one chart; only one shows at a time (a kg axis
// and a kg×reps axis have very different scales). dataKey picks the field.
const METRICS: Record<
  Metric,
  { label: string; dataKey: keyof ExerciseProgressPoint; unit: string }
> = {
  weight: { label: 'Max weight', dataKey: 'maxWeight', unit: 'kg' },
  volume: { label: 'Volume', dataKey: 'totalVolume', unit: 'kg·reps' },
};

interface ExerciseProgressChartProps {
  exerciseId: string | null;
}

// Per-session progress for the picked exercise. Sessions where the metric is null
// (e.g. a bodyweight day) leave a gap rather than dropping to zero.
export function ExerciseProgressChart({ exerciseId }: ExerciseProgressChartProps) {
  const [metric, setMetric] = useState<Metric>('weight');
  const { data: points = [], isPending } = useExerciseProgress(exerciseId);
  const config = METRICS[metric];

  if (exerciseId === null) {
    return <ChartPlaceholder>Select an exercise to see its progress.</ChartPlaceholder>;
  }
  if (isPending) {
    return <ChartPlaceholder>Loading…</ChartPlaceholder>;
  }
  const hasMetricData = points.some((point) => point[config.dataKey] !== null);
  if (points.length === 0 || !hasMetricData) {
    return (
      <ChartPlaceholder>
        No {config.label.toLowerCase()} logged for this exercise yet.
      </ChartPlaceholder>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted flex w-fit gap-1 rounded-md p-1">
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={metric === key ? 'default' : 'ghost'}
            className={cn('h-8', metric !== key && 'text-muted-foreground')}
            onClick={() => setMetric(key)}
          >
            {METRICS[key].label}
          </Button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
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
              formatter={(value) => [`${String(value)} ${config.unit}`, config.label]}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
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
