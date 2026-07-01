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

import type { BodyMeasurement, NutritionTarget } from '@gym-bro/shared';

import { buildTrendData, CALORIES_SERIES, type SeriesDef } from '../utils/trend-series';

// On by default: body weight + target calories.
const DEFAULT_SELECTED = ['weightKg', 'kcal'];

// Flexible trend chart: pick any combination of body measurements plus the
// target-calorie overlay (weight + calories by default). Measurements share the
// left axis; calories get the right axis (very different scale). 7- and 30-day
// moving-average overlays are optional toggles applied to the selected measures.
export function BodyTrendChart({
  entries,
  targets,
}: {
  entries: BodyMeasurement[];
  targets: NutritionTarget[];
}) {
  const { rows, availableMeasures, hasCalories } = buildTrendData(entries, targets);
  const selectable: SeriesDef[] = [...availableMeasures, ...(hasCalories ? [CALORIES_SERIES] : [])];

  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_SELECTED));
  const [showMa7, setShowMa7] = useState(false);
  const [showMa30, setShowMa30] = useState(false);

  if (selectable.length === 0) {
    return (
      <p className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Log measurements to see trends.
      </p>
    );
  }

  // Render the selected series that actually have data; fall back to the first
  // available so the chart is never empty.
  let active = selectable.filter((s) => selected.has(s.key));
  if (active.length === 0) active = [selectable[0]!];
  const measures = active.filter((s) => !s.isCalories);
  const caloriesOn = active.some((s) => s.isCalories);

  // Pad the calorie axis ~150 kcal beyond the actual target range (rounded to 50s)
  // so a near-flat target line sits in the band instead of glued to the top/bottom
  // edge. Without this, auto-domain hugs the values and it reads as a border line.
  const caloriesDomain = ((): [number, number] | undefined => {
    const values = rows.map((r) => r.kcal).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return undefined;
    const lo = Math.max(0, Math.floor((Math.min(...values) - 150) / 50) * 50);
    const hi = Math.ceil((Math.max(...values) + 150) / 50) * 50;
    return [lo, hi];
  })();

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {selectable.map((s) => {
          const on = active.some((a) => a.key === s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                on
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {(
          [
            ['7-day avg', showMa7, setShowMa7],
            ['30-day avg', showMa30, setShowMa30],
          ] as const
        ).map(([label, value, set]) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant={value ? 'secondary' : 'ghost'}
            className={cn('h-7 px-2 text-xs', !value && 'text-muted-foreground')}
            onClick={() => set((v) => !v)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              yAxisId="left"
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={44}
            />
            {caloriesOn && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={caloriesDomain ?? ['auto', 'auto']}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                width={48}
              />
            )}
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
                const n = Number(value);
                return [name === 'Calories' ? `${Math.round(n)} kcal` : n.toFixed(1), name];
              }}
            />
            <Legend />
            {measures.map((s) => (
              <Line
                key={s.key}
                yAxisId="left"
                name={s.label}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
            {showMa7 &&
              measures.map((s) => (
                <Line
                  key={`${s.key}-ma7`}
                  yAxisId="left"
                  name={`${s.label} 7d`}
                  type="monotone"
                  dataKey={`${s.key}__ma7`}
                  stroke={s.color}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls
                />
              ))}
            {showMa30 &&
              measures.map((s) => (
                <Line
                  key={`${s.key}-ma30`}
                  yAxisId="left"
                  name={`${s.label} 30d`}
                  type="monotone"
                  dataKey={`${s.key}__ma30`}
                  stroke={s.color}
                  strokeWidth={1.5}
                  strokeDasharray="1 3"
                  dot={false}
                  connectNulls
                />
              ))}
            {caloriesOn && (
              <Line
                yAxisId="right"
                name="Calories"
                type="stepAfter"
                dataKey="kcal"
                stroke={CALORIES_SERIES.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
