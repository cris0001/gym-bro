import { Link } from '@tanstack/react-router';
import { format, subDays } from 'date-fns';

import { useBodyMeasurements } from '@/features/body';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useDashboardTranslation } from '../i18n';
import { WeightSparkline, type WeightPoint } from './weight-sparkline';

// Trend window for the sparkline and the "in 90 days" change.
const TREND_DAYS = 90;

function Delta({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'font-medium',
        value <= 0 ? 'text-[#5a7a52] dark:text-[#8fae85]' : 'text-foreground',
      )}
    >
      {value > 0 ? '+' : ''}
      {value.toFixed(1)} kg
    </span>
  );
}

// Latest logged weight, its change since the previous measurement and over the last
// 90 days, plus a sparkline of that window — or a prompt to log one.
export function LatestWeightCard() {
  const { data: entries = [], isPending } = useBodyMeasurements();
  const t = useDashboardTranslation();

  // Entries arrive newest first; keep only days with a weight.
  const weighed = entries.filter((entry) => entry.weightKg !== null);
  const latest = weighed[0]?.weightKg ?? null;
  const previous = weighed[1]?.weightKg ?? null;
  const delta = latest !== null && previous !== null ? latest - previous : null;

  const since = format(subDays(new Date(), TREND_DAYS), 'yyyy-MM-dd');
  const trend: WeightPoint[] = weighed
    .filter((entry) => entry.measuredDate >= since)
    .map((entry) => ({ date: entry.measuredDate, weight: entry.weightKg! }))
    .reverse();
  const trendStart = trend[0]?.weight ?? null;
  const trendDelta =
    latest !== null && trendStart !== null && trend.length > 1 ? latest - trendStart : null;

  return (
    <div className="bg-card flex flex-col gap-1 rounded-xl border p-5">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        {t.weight.label}
      </p>
      {isPending ? (
        <>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : latest !== null ? (
        <>
          <p className="font-heading text-[26px] leading-tight font-bold tabular-nums">
            {latest}
            <span className="text-muted-foreground text-base font-normal"> kg</span>
          </p>
          <p className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
            {delta !== null ? (
              <span>
                <Delta value={delta} /> {t.weight.sinceLast}
              </span>
            ) : (
              <span>{t.weight.firstEntry}</span>
            )}
            {trendDelta !== null ? (
              <span>
                <Delta value={trendDelta} /> {t.weight.in90Days}
              </span>
            ) : null}
          </p>
          <div className="mt-2">
            <WeightSparkline points={trend} />
          </div>
        </>
      ) : (
        <Link
          to="/body"
          className="bg-accent text-primary hover:bg-accent/70 mt-1 inline-flex h-9 w-fit items-center rounded-full px-3.5 text-[12.5px] font-semibold"
        >
          {t.weight.logWeight}
        </Link>
      )}
    </div>
  );
}
