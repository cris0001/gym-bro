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

import { useRatingTrend } from '../hooks/use-stats';

// Rating is a fixed 1–5 scale, so the Y axis is pinned to that domain rather than
// auto-scaling — keeps the trend comparable across time windows.
const RATING_TICKS = [1, 2, 3, 4, 5];

export function RatingTrendChart() {
  const { data: points = [], isPending } = useRatingTrend();

  if (isPending) {
    return <Placeholder>Loading…</Placeholder>;
  }
  if (points.length === 0) {
    return <Placeholder>No rated workouts yet.</Placeholder>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            domain={[1, 5]}
            ticks={RATING_TICKS}
            allowDecimals={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--card-foreground)',
            }}
            labelFormatter={(label) => format(parseISO(String(label)), 'PP')}
            formatter={(value) => [`${String(value)} / 5`, 'Rating']}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex h-64 items-center justify-center text-center text-sm">
      {children}
    </div>
  );
}
