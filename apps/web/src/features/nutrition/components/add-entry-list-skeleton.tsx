import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Placeholder rows for the add-entry results list while its data first loads, or under
// your own matches while a catalog search runs. Same footprint as AddEntryResultRow
// (thumb, two text lines, split add pill), so the real list replaces it in place
// instead of shifting the layout. `dividedFromAbove` puts a divider on the first row
// too, when it follows real rows.
export function AddEntryListSkeleton({
  dividerClassName,
  rows = 5,
  dividedFromAbove = false,
}: {
  dividerClassName: string;
  rows?: number;
  dividedFromAbove?: boolean;
}) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 min-[400px]:gap-3 min-[400px]:px-3.5 min-[400px]:py-3',
            (i > 0 || dividedFromAbove) && dividerClassName,
          )}
        >
          <Skeleton className="size-[38px] shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-[30px] w-[82px] shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
