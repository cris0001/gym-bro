import { Skeleton } from '@/components/ui/skeleton';

import { useStravaTranslation } from '../i18n';

const BAR_HEIGHTS = [40, 65, 30, 80, 55, 20, 70, 45, 90, 35, 60, 50];
const MICRO_LABEL = 'text-muted-foreground text-[10.5px] font-medium tracking-[0.08em] uppercase';

// Loading state for the connected Strava page body, in its real shape: the filter bar
// (sport pills + period switch), the stats — 2×2 tiles and the weekly bars — then the
// month card of activity rows. Labels stay real.
export function StravaContentSkeleton() {
  const t = useStravaTranslation();
  const tiles = [t.stats.activities, t.stats.distance, t.stats.movingTime, t.stats.elevation];
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {['w-12', 'w-20', 'w-20', 'w-24'].map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w} rounded-full`} />
          ))}
        </div>
        <Skeleton className="h-9 rounded-md sm:w-60" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-2">
            {tiles.map((label) => (
              <div key={label} className="bg-card rounded-xl border px-3.5 py-3">
                <p className={MICRO_LABEL}>{label}</p>
                <div className="mt-1 flex h-7 items-center">
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card flex flex-col gap-2.5 rounded-xl border px-4 py-3.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-24 items-end gap-1 border-b lg:h-auto lg:min-h-24 lg:flex-1">
              {BAR_HEIGHTS.map((height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t rounded-b-none"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <div className="flex h-4 items-center">
            <Skeleton className="h-3 w-28" />
          </div>
          <ul className="bg-card rounded-xl border">
            {['w-2/5', 'w-1/2', 'w-1/3', 'w-[45%]', 'w-2/5'].map((width, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-t px-3.5 py-3 first:border-t-0 md:px-4"
              >
                <Skeleton className="size-9 shrink-0 rounded-[10px]" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton className={`h-4 ${width}`} />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="hidden h-8 w-64 shrink-0 md:block" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
