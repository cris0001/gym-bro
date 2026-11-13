import { Skeleton } from '@/components/ui/skeleton';

import { useNutritionTranslation } from '../i18n';

// Loading state for the diary's day summary, in DaySummary's shape: the 96px calorie
// ring beside "N / target" and "N left", then the three macro rows (label + "x / y g"
// over an 8px bar). Macro labels stay real text; the numbers and bars pulse.
export function DaySummarySkeleton() {
  const t = useNutritionTranslation();
  const macros = [t.common.macroProtein, t.common.macroCarbs, t.common.macroFat];

  return (
    <div aria-hidden className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center">
          {/* The ring's track: a thick outline, hollow in the middle like the real one. */}
          <div className="border-muted skeleton-pulse size-[84px] rounded-full border-[9px]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex h-7 items-center">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {macros.map((label) => (
          <div key={label} className="grid gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">{label}</span>
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
