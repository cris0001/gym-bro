import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

// Skeleton bodies for the desktop "Add to meal" right pane while the day loads, each
// rendered inside its real card under the real micro-label. 'added': the meal's kcal
// and two entry rows (thumb, name over the macro line, kcal, delete). 'day': the
// "N / target kcal" line with its left-pill, then the three macro bars (labels real).
export function AddEntryDaySkeleton({
  variant,
  dividerClassName,
}: {
  variant: 'added' | 'day';
  dividerClassName: string;
}) {
  const t = useNutritionTranslation();

  if (variant === 'added') {
    return (
      <ul aria-hidden className={cn('mt-2 flex flex-col divide-y divide-dashed', dividerClassName)}>
        {['w-1/2', 'w-2/5'].map((width) => (
          <li key={width} className="flex items-center gap-3 py-2.5">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex h-6 items-center">
                <Skeleton className={cn('h-4', width)} />
              </div>
              <div className="flex h-[14px] items-center">
                <Skeleton className="h-2.5 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div aria-hidden>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex h-[30px] items-center">
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-[24.5px] w-20 shrink-0 rounded-full" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {[t.common.macroProtein, t.common.macroCarbs, t.common.macroFat].map((label) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
                {label}
              </span>
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-[5px] w-full rounded-[3px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
