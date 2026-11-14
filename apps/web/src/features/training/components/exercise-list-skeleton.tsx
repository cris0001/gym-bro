import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const NAME_WIDTHS = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3'];

function GroupSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Group label: 18px icon + 13px label (20px line). */}
      <div className="flex h-5 items-center gap-2 px-1">
        <Skeleton className="size-[18px] rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex flex-col gap-1.5">
        {NAME_WIDTHS.slice(0, rows).map((width) => (
          // Row: its own bordered card, 15px semibold name (py-2.5 around a ~22px line).
          <div key={width} className="bg-card flex h-[44px] items-center rounded-lg border px-3.5">
            <Skeleton className={cn('h-4', width)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading state for the exercise library, in the list's real shape: under "All" a
// few muscle groups of spaced rows (two side by side from md, three from 1300px),
// else one group.
export function ExerciseListSkeleton({ grouped }: { grouped: boolean }) {
  if (!grouped) return <GroupSkeleton rows={4} />;
  return (
    <div aria-hidden className="grid items-start gap-4 md:grid-cols-2 min-[1300px]:grid-cols-3">
      <GroupSkeleton rows={4} />
      <GroupSkeleton rows={3} />
      <GroupSkeleton rows={2} />
    </div>
  );
}
