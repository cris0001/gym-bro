import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Loading state for the /plans grid, in the real card's shape — name + Active /
// Set-active on top, an optional description line, and the "N templates · started"
// footer, each bar in a box as tall as its text so the swap doesn't shift. The count
// fills whole rows of the grid: 3 stacked on phones, 2 × 2 from sm, 3 in a row from lg.
const CARDS = [
  { name: 'w-1/2', description: true, className: '' },
  { name: 'w-2/5', description: false, className: '' },
  { name: 'w-3/5', description: true, className: '' },
  { name: 'w-1/3', description: false, className: 'hidden sm:flex lg:hidden' },
];

export function PlanCardsSkeleton() {
  return (
    <div aria-hidden className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((card, i) => (
        <div
          key={i}
          className={cn(
            'bg-card flex flex-col gap-2 rounded-xl border p-4 lg:min-h-[150px] lg:gap-3 lg:p-5',
            card.className,
          )}
        >
          <div className="flex items-start justify-between gap-2">
            {/* text-lg name (28px line; 28px at lg's text-xl too, close enough). */}
            <div className="flex h-7 flex-1 items-center">
              <Skeleton className={cn('h-5', card.name)} />
            </div>
            <Skeleton className="h-[19px] w-14 shrink-0 rounded-full" />
          </div>
          {card.description ? (
            <div className="flex h-5 items-center">
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          ) : null}
          <div className="mt-auto flex h-4 items-center">
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}
