import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useDashboardTranslation } from '../i18n';

// Full-page loading state for the dashboard: the silhouette of the real layout
// (header + start CTA, nutrition hero, weight trend + last workout, Strava block) so
// the first paint matches where content lands. Shown only on the initial load — a
// background refetch keeps the real content on screen. Micro-labels stay as real
// text; values pulse.
//
// Every pulsing bar sits in a `Line` box as tall as the text it stands in for (font
// size × line height, same gaps and paddings as the real cards), so the swap to real
// content doesn't shift anything.
const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';
const card = 'bg-card flex flex-col rounded-xl border p-5';

function Line({ height, className }: { height: string; className: string }) {
  return (
    <div className={cn('flex items-center', height)}>
      <Skeleton className={className} />
    </div>
  );
}

export function DashboardSkeleton() {
  const t = useDashboardTranslation();
  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-5 p-3 md:p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          {/* Date: text-sm (20px line); greeting: 28/34px at leading-tight. */}
          <Line height="h-5" className="h-3.5 w-32" />
          <Line height="h-[35px] lg:h-[42.5px]" className="h-7 w-52 lg:h-8" />
        </div>
        <Skeleton className="hidden h-9.5 w-40 rounded-full lg:block" />
      </header>

      <Skeleton className="h-9.5 w-full rounded-full lg:hidden" />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className={cn(card, 'gap-4')}>
          <p className={microLabel}>{t.skeleton.plate}</p>
          <div className="flex items-center gap-5">
            <Skeleton className="size-28 shrink-0 rounded-full lg:size-32" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {/* Each macro: a text-xs label row over a 6px bar. */}
              {['w-16', 'w-14', 'w-10'].map((width) => (
                <div key={width} className="flex flex-col gap-1">
                  <div className="flex h-4 items-center justify-between">
                    <Skeleton className={cn('h-3', width)} />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className={cn(card, 'gap-1.5')}>
          <p className={microLabel}>{t.skeleton.nextSession}</p>
          <div className="flex flex-col gap-0.5">
            <Line height="h-[27.5px]" className="h-5 w-3/5" />
            <Line height="h-5" className="h-3.5 w-2/5" />
          </div>
          <div className="mt-auto flex gap-2 pt-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weight: value, the two deltas, then the 80px sparkline + its date row. */}
        <div className={cn(card, 'gap-1')}>
          <p className={microLabel}>{t.skeleton.weight}</p>
          <Line height="h-[32.5px]" className="h-6 w-24" />
          <Line height="h-4" className="h-3 w-48" />
          <Skeleton className="mt-2 h-20 w-full rounded-lg" />
          <div className="flex h-4 items-center justify-between">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>
        {/* Last workout: label row (20px chevron), name, one meta line; sized to content. */}
        <div className={cn(card, 'gap-1 self-start')}>
          <div className="flex h-5 items-center">
            <p className={microLabel}>{t.skeleton.lastWorkout}</p>
          </div>
          <Line height="h-[27.5px]" className="h-5 w-1/2" />
          <Line height="h-4" className="h-3 w-3/4" />
        </div>
      </div>

      {/* Strava: a rule above, then the last activity beside the weekly-volume card. */}
      <div className="grid gap-4 border-t pt-5 lg:grid-cols-2">
        <div className={cn(card, 'gap-1')}>
          <p className={microLabel}>{t.skeleton.lastActivity}</p>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex flex-col">
              <Line height="h-[25px]" className="h-4 w-36" />
              <Line height="h-5" className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-6 pt-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col">
                <Line height="h-[23px]" className="h-4 w-14" />
                <Line height="h-4" className="h-2.5 w-10" />
              </div>
            ))}
          </div>
        </div>
        <div className={cn(card, 'gap-3')}>
          <div className="flex h-8 items-center">
            <p className={microLabel}>{t.skeleton.lastWeeks}</p>
          </div>
          <Line height="h-[23px]" className="h-5 w-28" />
          <div className="grid h-24 grid-cols-8 items-end gap-2">
            {['h-1/2', 'h-3/4', 'h-2/5', 'h-full', 'h-3/5', 'h-4/5', 'h-2/3', 'h-1/2'].map(
              (height, i) => (
                <Skeleton key={i} className={cn('rounded-sm', height)} />
              ),
            )}
          </div>
          <div className="flex h-4 items-center justify-between">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
