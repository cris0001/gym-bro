import { Skeleton } from '@/components/ui/skeleton';

// Loading state for the rating summary, in its real shape: the big average + the
// last-30-days figure, the 5★…1★ breakdown (labels stay real, bars and counts pulse)
// and the "Latest" rows. Each bar sits in a box as tall as the text it replaces.
const BAR_WIDTHS = ['w-4/5', 'w-full', 'w-1/2', 'w-1/5', 'w-[8%]'];

export function RatingSummarySkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex h-[44px] items-center">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((stars, i) => (
          <div key={stars} className="flex h-[19px] items-center gap-2.5 text-[12.5px]">
            <span className="text-muted-foreground w-6 shrink-0 tabular-nums">{stars}★</span>
            <div className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
              <Skeleton className={`h-full rounded-full ${BAR_WIDTHS[i]}`} />
            </div>
            <Skeleton className="h-3 w-4 shrink-0" />
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-[0.08em] uppercase">
          Latest
        </p>
        <ul className="divide-border divide-y">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-3 py-2">
              <div className="flex h-5 w-12 shrink-0 items-center">
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="flex h-5 min-w-0 flex-1 items-center">
                <Skeleton className="h-3.5 w-2/5" />
              </div>
              <Skeleton className="h-3.5 w-[78px] shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
