import { Skeleton } from '@/components/ui/skeleton';

import { MEAL_TYPES } from '@gym-bro/shared';

import { useNutritionTranslation } from '../i18n';

// How many placeholder entries each meal shows while the day loads — a plausible mix,
// so the list reads as a diary rather than five identical blocks.
const ROWS = [2, 1, 2, 1, 2];

// Loading state for the diary's five meal sections, in MealSection's shape: the real
// meal name with a pulsing kcal subtotal and the two add actions, then entry rows
// (name over the amount · macros line, kcal and delete on the right). Meal names are
// real text — they're known before the data is.
export function MealSectionsSkeleton() {
  const t = useNutritionTranslation();

  return (
    <div aria-hidden className="flex flex-col gap-3">
      {MEAL_TYPES.map((meal, i) => (
        <div key={meal} className="bg-card flex flex-col rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="font-heading text-lg font-semibold">{t.meals[meal]}</h2>
              <Skeleton className="h-3.5 w-14" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
          </div>
          <ul className="mt-1 flex flex-col divide-y divide-dashed divide-border-strong">
            {Array.from({ length: ROWS[i] ?? 1 }, (_, row) => (
              <li key={row} className="flex items-center gap-3 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Name: 16px semibold (24px line); meta: 11px leading-tight. */}
                  <div className="flex h-6 items-center">
                    <Skeleton className={row % 2 === 0 ? 'h-4 w-2/5' : 'h-4 w-1/3'} />
                  </div>
                  <div className="flex h-[14px] items-center">
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14 shrink-0" />
                <Skeleton className="size-8 shrink-0 rounded-[10px]" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
