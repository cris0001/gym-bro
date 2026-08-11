import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder for a chart card: a short title line, five bottom-aligned bars of
// varying height, and a baseline axis rule — the silhouette of the real Recharts cards.
const BAR_HEIGHTS = [58, 80, 44, 70, 52];

export function SkeletonChart() {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <Skeleton className="h-3 w-2/5" />
      <div className="flex h-40 items-end gap-2">
        {BAR_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-[6px] rounded-b-none"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-px w-full rounded-none" />
    </div>
  );
}
