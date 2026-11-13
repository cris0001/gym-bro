import { Skeleton } from '@/components/ui/skeleton';

import { useBodyTranslation } from '../i18n';

// Loading state for the trends card body (under the period/date controls, which stay
// live): the four weight stats — labels real, values pulsing — then the series chips,
// the 7/30-day average toggles, and the 256px chart area.
export function BodyTrendsSkeleton() {
  const t = useBodyTranslation();
  const stats = [t.stats.current, t.stats.change, t.stats.lowest, t.stats.highest];

  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((label) => (
          <div key={label} className="flex flex-col">
            <span className="text-muted-foreground text-xs">{label}</span>
            {/* text-lg value: 28px line. */}
            <div className="flex h-7 items-center">
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {['w-20', 'w-16', 'w-[72px]'].map((width) => (
            <Skeleton key={width} className={`h-[26px] rounded-full ${width}`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
