import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder for the dashboard nutrition hero: a calorie ring on the left and
// three macro bars on the right — the silhouette of TodayNutritionCard's body. Rendered
// inside the existing card, so it carries no border of its own.
export function SkeletonHero() {
  return (
    <div className="flex items-center gap-5">
      <Skeleton className="size-28 shrink-0 rounded-full lg:size-32" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-2 w-24" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
