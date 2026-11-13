import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Loading state for a calendar day's detail: one card shaped like an expanded Finished
// workout (DayWorkoutItem) — header row (40px icon, text-lg title over a text-xs line,
// status pill), then exercises as a name over set pills, and the Open / edit / delete
// footer — so the panel isn't blank, or wrongly "Nothing this day", while its month
// loads. Bars sit in boxes as tall as the text they stand in for, to avoid a jump.
const EXERCISES = [
  { name: 'w-2/5', sets: 4 },
  { name: 'w-1/3', sets: 3 },
  { name: 'w-1/2', sets: 3 },
];

function Line({ height, className }: { height: string; className: string }) {
  return (
    <div className={cn('flex items-center', height)}>
      <Skeleton className={className} />
    </div>
  );
}

export function DayDetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4 p-4">
      <div className="bg-card overflow-hidden rounded-2xl border">
        <div className="flex items-center gap-3 p-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Line height="h-[22.5px]" className="h-4 w-2/5" />
            <Line height="h-4" className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-[19px] w-16 shrink-0 rounded-full" />
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-3">
          {EXERCISES.map((exercise, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Line height="h-[22.5px]" className={cn('h-3.5', exercise.name)} />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: exercise.sets }, (_, set) => (
                  <Skeleton key={set} className="h-6 w-[58px] rounded-lg" />
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 border-t border-border pt-3">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <Skeleton className="size-10 shrink-0 rounded-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  );
}
