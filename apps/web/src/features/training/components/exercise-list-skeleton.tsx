import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const NAME_WIDTHS = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3', 'w-[45%]', 'w-[55%]'];

// Loading state for the exercise library, in the list's real shape: dashed-divided
// rows on phones, a 2/3-column grid of cards from md. Six items fill whole grid rows at
// both widths. The category icon only shows under "All", as in the real rows.
export function ExerciseListSkeleton({ withIcon }: { withIcon: boolean }) {
  return (
    <ul
      aria-hidden
      className="divide-y divide-dashed divide-border md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 lg:grid-cols-3"
    >
      {NAME_WIDTHS.map((width) => (
        <li
          key={width}
          className="flex items-center gap-3 px-4 py-3 md:bg-card md:rounded-2xl md:border md:py-4"
        >
          {withIcon ? <Skeleton className="size-9 shrink-0 rounded-full" /> : null}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Name: 16px semibold (24px line); category: text-xs (16px line). */}
            <div className="flex h-6 items-center">
              <Skeleton className={cn('h-4', width)} />
            </div>
            <div className="flex h-4 items-center">
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
