import { Link } from '@tanstack/react-router';

import { Skeleton } from '@/components/ui/skeleton';

import { useSessionsTranslation } from '../i18n';

// Loading shape of the workout detail, mirroring its layout: header, four stat
// tiles, then the exercise rows card.
export function WorkoutDetailSkeleton() {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-4 p-3.5 md:p-4 lg:col-start-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex w-2/3 flex-col gap-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-9.5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <Skeleton className="h-[84px] rounded-xl" />
        <Skeleton className="h-[84px] rounded-xl" />
        {/* Volume + sets tiles are desktop-only. */}
        <Skeleton className="hidden h-[84px] rounded-xl sm:block" />
        <Skeleton className="hidden h-[84px] rounded-xl sm:block" />
      </div>
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  );
}

export function WorkoutNotFound() {
  const t = useSessionsTranslation();
  return (
    <div className="mx-auto w-full max-w-2xl p-3.5 md:p-4 lg:col-span-3">
      <div className="bg-card flex flex-col items-center gap-4 rounded-xl border px-5 py-8 text-center">
        <p className="font-heading text-[20px] font-semibold">{t.workoutDetail.notFound}</p>
        <Link
          to="/calendar"
          className="border-border-strong bg-card text-primary hover:bg-muted inline-flex h-10 items-center rounded-full border px-6 text-[14px] font-semibold transition-colors"
        >
          {t.workoutDetail.backToCalendar}
        </Link>
      </div>
    </div>
  );
}
