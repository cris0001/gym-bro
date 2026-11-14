import { Skeleton } from '@/components/ui/skeleton';

// Loading state for StartPlannedCard in its shape: phones get the compact row
// (label, name, meta + Start pill), lg up the hero (with the exercise list and a
// full-width Start).
export function StartPlannedCardSkeleton() {
  return (
    <div
      aria-hidden
      className="bg-card flex items-center gap-3 rounded-xl border p-3.5 lg:flex-col lg:items-stretch lg:gap-3.5 lg:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-32 lg:h-7 lg:w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="hidden flex-col gap-2 lg:flex">
        {['w-36', 'w-44', 'w-32', 'w-28'].map((width) => (
          <Skeleton key={width} className={`h-3.5 ${width}`} />
        ))}
      </div>
      <Skeleton className="h-9.5 w-20 shrink-0 rounded-full lg:h-10 lg:w-full" />
    </div>
  );
}
