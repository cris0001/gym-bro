import { Skeleton } from '@/components/ui/skeleton';

// Loading state for the Strava main column, in its real shape: the stats dashboard
// (sport filter pills, the period switch, the totals tiles), the 12-week bar card, then
// a month heading over activity rows (sport icon, name over the "type · date · stat"
// line, chevron). Tile and card labels stay real text; values pulse.
const BAR_HEIGHTS = [40, 65, 30, 80, 55, 20, 70, 45, 90, 35, 60, 50];
const TILES = ['Activities', 'Distance', 'Moving time', 'Elevation'];

export function StravaContentSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Skeleton className="h-10 w-12 rounded-full" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="size-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 self-center rounded-full" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TILES.map((label) => (
            <div key={label} className="bg-secondary/60 rounded-xl p-3 text-center">
              {/* text-lg value: 28px line. */}
              <div className="flex h-7 items-center justify-center">
                <Skeleton className="bg-muted-foreground/15 h-5 w-14" />
              </div>
              <p className="text-muted-foreground text-[11px] tracking-[0.08em] uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card flex flex-col gap-2 rounded-xl border p-4">
        <div className="flex h-4 items-center">
          <Skeleton className="h-3 w-52" />
        </div>
        <div className="flex h-24 items-end gap-1">
          {BAR_HEIGHTS.map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t rounded-b-none"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex h-7 items-center py-1">
          <Skeleton className="h-3 w-24" />
        </div>
        <ul className="flex flex-col gap-2">
          {['w-2/5', 'w-1/2', 'w-1/3', 'w-[45%]', 'w-2/5'].map((width, i) => (
            <li key={i} className="bg-card flex items-center gap-3 rounded-xl border p-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-6 items-center">
                  <Skeleton className={`h-4 ${width}`} />
                </div>
                <div className="flex h-4 items-center">
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="size-4 shrink-0 rounded-[4px]" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
