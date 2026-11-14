import { Skeleton } from '@/components/ui/skeleton';

// Loading state for the measurement history, in MeasurementList's shape: a month
// label over a card of rows (weight + date line, then the edit/delete buttons).
export function MeasurementListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <div className="flex h-4 items-center px-0.5">
        <Skeleton className="h-3 w-24" />
      </div>
      <ul className="bg-card rounded-xl border">
        {['w-40', 'w-32', 'w-44', 'w-36'].map((width, i) => (
          <li
            key={i}
            className="flex items-center gap-3 border-t px-4 py-2.5 first:border-t-0 md:px-5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className={`h-3 ${width}`} />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
