import { Skeleton } from '@/components/ui/skeleton';

// The exercise picker's list while the exercises (or the template's) load: rows in
// the real rows' shape inside the same card, instead of a "no matches" flash.
export function ExercisePickerSkeleton() {
  return (
    <ul aria-hidden className="bg-card overflow-hidden rounded-xl border">
      {[0, 1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="border-border flex items-center gap-3 border-t px-3.5 py-2.5 first:border-t-0"
        >
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
