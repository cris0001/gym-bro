import { Link } from '@tanstack/react-router';

import { useBodyMeasurements } from '@/features/body';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Latest logged weight and its change since the previous measurement, or a prompt
// to log one. Text-forward stat card — micro-label over a big serif value.
export function LatestWeightCard() {
  const { data: entries = [], isPending } = useBodyMeasurements();

  const weights = entries
    .filter((entry) => entry.weightKg !== null)
    .map((entry) => entry.weightKg!);
  const latest = weights[0] ?? null;
  const previous = weights[1] ?? null;
  const delta = latest !== null && previous !== null ? latest - previous : null;

  return (
    <div className="bg-card flex flex-col gap-1 rounded-2xl border p-5">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        Weight
      </p>
      {isPending ? (
        <>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : latest !== null ? (
        <>
          <p className="font-heading text-[26px] leading-tight font-semibold">
            {latest}
            <span className="text-muted-foreground text-base font-normal"> kg</span>
          </p>
          <p className="text-muted-foreground text-xs">
            {delta !== null ? (
              <>
                <span
                  className={cn(
                    'font-medium',
                    delta <= 0 ? 'text-[#5a7a52] dark:text-[#8fae85]' : 'text-foreground',
                  )}
                >
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)} kg
                </span>{' '}
                since last
              </>
            ) : (
              'First entry'
            )}
          </p>
        </>
      ) : (
        <Link to="/body" className="text-primary text-sm underline">
          Log your weight
        </Link>
      )}
    </div>
  );
}
