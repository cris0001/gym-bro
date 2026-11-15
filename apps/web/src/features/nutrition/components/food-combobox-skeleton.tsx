import { Skeleton } from '@/components/ui/skeleton';

// The food picker's list while the foods load, instead of a "no foods yet" flash.
export function FoodComboboxSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-1.5 p-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-9 rounded-md" />
      ))}
    </div>
  );
}
