import { ChevronLeft } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

// Loading state for /recipes/$id, mirroring RecipeBuilder at every width with the same
// containers and breakpoints: under 1300px the photo tile sits beside the title over a
// single column (name, ingredients, servings, per-serving card, Cancel | Save); from
// 1300px it's photo | name + ingredients | servings + summary + buttons. Labels stay
// real text; values pulse, each in a box as tall as the text it replaces.
const INGREDIENT_WIDTHS = ['w-2/5', 'w-1/3', 'w-1/2'];

function Line({ height, className }: { height: string; className: string }) {
  return (
    <div className={cn('flex items-center', height)}>
      <Skeleton className={className} />
    </div>
  );
}

export function RecipeBuilderSkeleton() {
  const t = useNutritionTranslation();
  const microLabel = 'text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase';

  return (
    <div
      aria-hidden
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4 lg:col-span-3"
    >
      <span className="text-muted-foreground inline-flex w-fit items-center gap-1 text-[14px] font-semibold">
        <ChevronLeft className="size-4" />
        {t.recipes.title}
      </span>

      <div className="flex items-center gap-4 sm:gap-5">
        <Skeleton className="size-28 shrink-0 rounded-2xl sm:size-36 min-[1300px]:hidden" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Line
            height="h-[32.5px] min-[1300px]:h-[37.5px]"
            className="h-6 w-1/2 min-[1300px]:h-7"
          />
          <Line height="h-5 min-[1300px]:hidden" className="h-3.5 w-3/4 max-w-72" />
        </div>
      </div>

      <div className="flex flex-col gap-4 min-[1300px]:grid min-[1300px]:grid-cols-[240px_minmax(0,1fr)_300px] min-[1300px]:items-start min-[1300px]:gap-6">
        <div className="hidden flex-col gap-3 min-[1300px]:flex">
          <Skeleton className="aspect-square w-full rounded-[18px]" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Skeleton className="h-11 w-full rounded-xl" />

          <div className="border-border bg-card overflow-hidden rounded-[20px] border">
            <p className={cn(microLabel, 'px-4 pt-4 pb-3')}>{t.recipes.ingredients}</p>
            <ul>
              {INGREDIENT_WIDTHS.map((width) => (
                <li
                  key={width}
                  className="border-border flex items-center gap-3 border-t border-dashed px-4 py-3.5"
                >
                  <Skeleton className="size-10 shrink-0 rounded-[10px]" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Line height="h-[21px]" className={cn('h-3.5', width)} />
                    <Line height="h-[22px] mt-1" className="h-3 w-40" />
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <Line height="h-5" className="h-4 w-16" />
                    <Line height="h-[18px] mt-0.5" className="h-3 w-10" />
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-border border-t border-dashed p-3">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border-border bg-card flex items-center justify-between gap-4 rounded-[20px] border p-4">
            <div className="min-w-0">
              <p className={microLabel}>{t.recipes.servings}</p>
              <p className="text-muted-foreground text-[12.5px] leading-snug">
                {t.recipes.servingsHint}
              </p>
            </div>
            <Skeleton className="h-11 w-[120px] shrink-0 rounded-full" />
          </div>

          {/* The dark summary card keeps its own fill; bars pulse on top of it. */}
          <div className="flex flex-col rounded-[20px] bg-[#2b2126] p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-heading text-[19px] font-semibold text-[#f0e7ea]">
                {t.recipes.perServing}
              </p>
              <Skeleton className="h-[30px] w-20 bg-[#3a2f34]" />
            </div>
            <Skeleton className="mt-4 h-2 w-full rounded-full bg-[#3a2f34]" />
            <div className="mt-2.5 flex h-[19px] items-center justify-between">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-3 w-12 bg-[#3a2f34]" />
              ))}
            </div>
            <Line height="h-[18px] mt-3" className="h-3 w-4/5 bg-[#3a2f34]" />
          </div>

          <div className="grid grid-cols-[1fr_1.4fr] gap-2 min-[1300px]:flex min-[1300px]:flex-col-reverse">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
