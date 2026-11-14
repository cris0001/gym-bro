import { format, parseISO } from 'date-fns';

export interface WeightPoint {
  date: string;
  weight: number;
}

const WIDTH = 300;
const HEIGHT = 70;
// Vertical breathing room so the line never touches the top/bottom edge.
const PAD = 8;

// A tiny area + line chart of recent weigh-ins (oldest → newest), plotted by calendar
// date so sparse logging keeps honest spacing. Plain SVG — Recharts would be heavy
// for a decorative trend on the home screen.
export function WeightSparkline({ points }: { points: WeightPoint[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 2) return null;

  const start = parseISO(first.date).getTime();
  const span = parseISO(last.date).getTime() - start || 1;
  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const range = Math.max(...weights) - min || 1;

  const coords = points
    .map((p) => {
      const x = ((parseISO(p.date).getTime() - start) / span) * WIDTH;
      const y = PAD + (1 - (p.weight - min) / range) * (HEIGHT - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-20 w-full"
        role="img"
        aria-label={`Weight from ${first.weight} to ${last.weight} kg`}
      >
        <polygon points={`${coords} ${WIDTH},${HEIGHT} 0,${HEIGHT}`} className="fill-accent" />
        <polyline
          points={coords}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-primary"
        />
      </svg>
      <div className="text-muted-foreground flex justify-between text-[11px]">
        <span>{format(parseISO(first.date), 'MMM d')}</span>
        <span>{format(parseISO(last.date), 'MMM d')}</span>
      </div>
    </div>
  );
}
