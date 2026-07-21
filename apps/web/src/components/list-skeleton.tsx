import { Skeleton } from '@/components/ui/skeleton';

// Placeholder for a loading list of two-line rows (name + subtitle), matching the
// shape of the food/recipe/exercise/tag/plan lists. Rows are static, so a plain
// index key is fine.
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
