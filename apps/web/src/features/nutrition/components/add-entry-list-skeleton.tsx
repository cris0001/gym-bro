import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Placeholder rows for the add-entry results list while its data first loads. Same
// footprint as AddEntryResultRow (thumb, two text lines, round "+"), so the real list
// replaces it in place instead of shifting the layout.
export function AddEntryListSkeleton({ dividerClassName }: { dividerClassName: string }) {
  return (
    <div aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn('flex items-center gap-3 px-3.5 py-3', i > 0 && dividerClassName)}
        >
          <Skeleton className="size-[38px] shrink-0 rounded-[10px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="size-[34px] shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
