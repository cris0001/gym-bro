import { Skeleton } from '@/components/ui/skeleton';

const BAR_HEIGHTS = [35, 60, 45, 80, 30, 70, 55, 90];

// Loading state for the dashboard's Strava block while the connection status or the
// activities are still loading — in the connected layout's shape (last activity +
// weekly bars), so a linked account never flashes the "Connect Strava" card.
export function StravaSectionSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 border-t pt-5 lg:grid-cols-2">
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <div className="flex gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-24" />
        <div className="mt-auto grid h-24 grid-cols-8 items-end gap-2">
          {BAR_HEIGHTS.map((h, i) => (
            <Skeleton key={i} className="rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
