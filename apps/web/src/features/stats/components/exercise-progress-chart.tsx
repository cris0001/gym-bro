import { format, parseISO } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SkeletonChart } from '@/components/skeletons';

import type { StatsRange } from '../api/stats';
import { useExerciseProgress } from '../hooks/use-stats';
import { headline, latestText, modeOf, setLabel, tierValue } from '../utils/exercise-progress';
import { ChartPlaceholder } from './chart-placeholder';
import { ProgressFigure } from './progress-figure';

const TOP_COLOR = 'var(--primary)';
const NORMAL_COLOR = 'var(--soft)';

// Per-session progress for the picked exercise: the top set and the normal (back-off)
// set as two lines (in kg, or in reps for bodyweight-only exercises), under three
// headline numbers. The full sets show in the tooltip.
export function ExerciseProgressChart({
  exerciseId,
  range,
}: {
  exerciseId: string | null;
  range?: StatsRange | undefined;
}) {
  const { data: points = [], isPending } = useExerciseProgress(exerciseId, range);
  const { data: allTime = [] } = useExerciseProgress(exerciseId);

  if (exerciseId === null) {
    return <ChartPlaceholder>Select an exercise to see its progress.</ChartPlaceholder>;
  }
  if (isPending) return <SkeletonChart />;
  if (points.length === 0) {
    return <ChartPlaceholder>No sessions with this exercise in this period.</ChartPlaceholder>;
  }

  const mode = modeOf(allTime.length > 0 ? allTime : points);
  const unit = mode === 'kg' ? ' kg' : ' reps';
  const data = points.map((p) => ({
    date: p.date,
    top: tierValue(p.topWeight, p.topReps, mode),
    normal: tierValue(p.normalWeight, p.normalReps, mode),
    topLabel: setLabel(p.topWeight, p.topReps),
    normalLabel: setLabel(p.normalWeight, p.normalReps),
  }));
  const h = headline(points, allTime, mode);
  const latest = h.latest ? latestText(h.latest, mode) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Headline numbers are desktop/tablet only — phones get the chart alone. */}
      <div className="hidden flex-wrap gap-x-7 gap-y-2 sm:flex">
        {latest && (
          <ProgressFigure
            value={latest.value}
            unit={latest.unit}
            label={h.latestIsTop ? 'Latest top set' : 'Latest set'}
          />
        )}
        {h.change !== null && (
          <ProgressFigure
            value={`${h.change > 0 ? '+' : ''}${h.change}`}
            unit={unit}
            label="in this period"
            tone={h.change > 0 ? 'up' : h.change < 0 ? 'down' : undefined}
          />
        )}
        {h.best && (
          <ProgressFigure
            value={mode === 'kg' && h.best.value === 0 ? 'BW' : `${h.best.value}`}
            unit={mode === 'kg' && h.best.value === 0 ? '' : unit}
            label={`Best ever · ${format(parseISO(h.best.date), 'MMM d')}`}
          />
        )}
      </div>

      {/* Phones: the chart bleeds into the card padding so the plot gets the width. */}
      <div className="-mx-2.5 h-64 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -14 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              domain={['auto', 'auto']}
              padding={{ bottom: 14 }}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const row = payload[0]!.payload as (typeof data)[number];
                return (
                  <div className="bg-card text-card-foreground rounded-lg border px-3 py-2 text-sm shadow-sm">
                    <p className="mb-0.5 font-medium">{format(parseISO(String(label)), 'PP')}</p>
                    {row.topLabel && <p className="text-accent-foreground">★ {row.topLabel}</p>}
                    {row.normalLabel && <p className="text-muted-foreground">{row.normalLabel}</p>}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="normal"
              stroke={NORMAL_COLOR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="top"
              stroke={TOP_COLOR}
              strokeWidth={3}
              dot={{ r: 3, fill: TOP_COLOR }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-subtle-foreground flex gap-5 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-primary h-[3px] w-3.5 rounded-full" />
          Top set
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-soft h-[2px] w-3.5 rounded-full" />
          Normal sets
        </span>
      </div>
    </div>
  );
}
