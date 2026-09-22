import { Skeleton } from '@/components/ui/skeleton';

import { useDashboardTranslation } from '../i18n';

// Full-page loading state for the dashboard: the silhouette of the real layout
// (header + start CTA, nutrition hero, stat cards, Strava block) so the first paint
// matches where content lands. Shown only on the initial load — a background refetch
// keeps the real content on screen. Micro-labels stay as real text; values pulse.
const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';
const card = 'bg-card flex flex-col gap-3 rounded-2xl border p-5';

export function DashboardSkeleton() {
  const t = useDashboardTranslation();
  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-5 p-3 md:p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-52" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="hidden h-11 w-40 rounded-full lg:block" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </header>

      <Skeleton className="h-12 w-full rounded-full lg:hidden" />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className={card}>
          <p className={microLabel}>{t.skeleton.plate}</p>
          <div className="flex items-center gap-5">
            <Skeleton className="size-28 shrink-0 rounded-full lg:size-32" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-1.5 w-4/5 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className={card}>
          <p className={microLabel}>{t.skeleton.nextSession}</p>
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <div className="mt-auto flex gap-2 pt-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <p className={microLabel}>{t.skeleton.weight}</p>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className={card}>
          <p className={microLabel}>{t.skeleton.lastWorkout}</p>
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-lg font-semibold">{t.skeleton.strava}</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={card}>
            <p className={microLabel}>{t.skeleton.lastActivity}</p>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className={card}>
            <p className={microLabel}>{t.skeleton.thisMonth}</p>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
