import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Loading state for the connected Strava panel, in StravaConnectionCard's shape: the
// sport-tinted icon beside "Strava connected", the athlete and last-sync lines, then
// the Import / Disconnect buttons.
export function StravaConnectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('bg-card flex flex-col gap-3 rounded-2xl border p-4', className)}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col">
          <div className="flex h-6 items-center">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex h-4 items-center">
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex h-4 items-center">
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-[104px] rounded-full" />
      </div>
    </div>
  );
}
