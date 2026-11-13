import { ChevronDown } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

// Loading state for the measurement history, in MeasurementList's shape: an open month
// header (chevron, month name, count) over dashed-divided rows — chevron slot, date,
// "N kg · N kcal", then the edit and delete buttons.
export function MeasurementListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <div className="flex items-center gap-2 py-2.5">
        <ChevronDown className="text-muted-foreground size-4" />
        <div className="flex h-6 items-center">
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="ml-auto h-3 w-4" />
      </div>
      <ul className="divide-y divide-dashed divide-border-strong border-t border-dashed border-border-strong">
        {['w-24', 'w-32', 'w-28', 'w-24', 'w-32'].map((width, i) => (
          <li key={i} className="flex items-center gap-2 py-2 text-sm">
            <span className="size-4 shrink-0" />
            <div className="flex h-5 w-20 shrink-0 items-center">
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="flex h-5 min-w-0 flex-1 items-center">
              <Skeleton className={`h-3.5 ${width}`} />
            </div>
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
