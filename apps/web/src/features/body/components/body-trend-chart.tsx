import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
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

import { movingAverage, type BodyMeasurement } from '@gym-bro/shared';

// Each chartable measurement and how its values read.
const MEASURES = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'bodyFatPct', label: 'Body fat', unit: '%' },
  { key: 'bicepsCm', label: 'Biceps', unit: 'cm' },
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'hipCm', label: 'Hip', unit: 'cm' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm' },
] as const;

type MeasureKey = (typeof MEASURES)[number]['key'];

// Build the chart rows for one measure: the raw value plus its 7- and 30-day
// (calendar-window) moving averages, oldest first. Entries arrive newest-first.
function buildData(entries: BodyMeasurement[], key: MeasureKey) {
  const series = entries
    .filter((e) => e[key] !== null)
    .map((e) => ({ date: e.measuredDate, value: e[key]! }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const ma7 = movingAverage(series, 7);
  const ma30 = movingAverage(series, 30);
  return series.map((p, i) => ({
    date: p.date,
    value: p.value,
    ma7: ma7[i]!.average,
    ma30: ma30[i]!.average,
  }));
}

// Trend chart for a selectable body measurement: the raw series with 7- and
// 30-day moving-average overlays. Only measures with data are offered.
export function BodyTrendChart({ entries }: { entries: BodyMeasurement[] }) {
  const available = MEASURES.filter((m) => entries.some((e) => e[m.key] !== null));
  const [selected, setSelected] = useState<MeasureKey>('weightKg');

  useEffect(() => {
    if (available.length > 0 && !available.some((m) => m.key === selected)) {
      setSelected(available[0]!.key);
    }
  }, [available, selected]);

  if (available.length === 0) {
    return (
      <p className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Log measurements to see trends.
      </p>
    );
  }

  const measure = MEASURES.find((m) => m.key === selected) ?? available[0]!;
  const data = buildData(entries, measure.key);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {available.map((m) => (
          <Button
            key={m.key}
            type="button"
            size="sm"
            variant={measure.key === m.key ? 'default' : 'ghost'}
            className={cn('h-8', measure.key !== m.key && 'text-muted-foreground')}
            onClick={() => setSelected(m.key)}
          >
            {m.label}
          </Button>
        ))}
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
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--card-foreground)',
              }}
              labelFormatter={(label) => format(parseISO(String(label)), 'PP')}
              formatter={(value) => `${Number(value).toFixed(1)} ${measure.unit}`}
            />
            <Legend />
            <Line
              name={measure.label}
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              name="7-day avg"
              type="monotone"
              dataKey="ma7"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              name="30-day avg"
              type="monotone"
              dataKey="ma30"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
