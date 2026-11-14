import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Loading rows for the targets history, in TargetsHistory's shape: the slim left bar
// (plum on the first row — the target in force), "N kcal" with the Current pill on
// top, the "Since … · P · C · F" line under it, and the edit button.
export function TargetsHistorySkeleton() {
  return (
    <ul aria-hidden className="divide-y divide-border">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          <span
            className={cn(
              'w-1 shrink-0 self-stretch rounded-full',
              i === 0 ? 'bg-primary/40' : 'bg-border',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex h-5 items-center gap-2">
              <Skeleton className="h-4 w-24" />
              {i === 0 ? <Skeleton className="h-[19px] w-16 rounded-full" /> : null}
            </div>
            <div className="mt-0.5 flex h-[17px] items-center">
              <Skeleton className="h-3 w-4/5 max-w-64" />
            </div>
          </div>
          <Skeleton className="size-8 shrink-0 rounded-[10px]" />
        </li>
      ))}
    </ul>
  );
}
