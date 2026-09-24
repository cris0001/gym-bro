import { Link } from '@tanstack/react-router';

import { Skeleton } from '@/components/ui/skeleton';

import { useSessionsTranslation } from '../i18n';

// Loading shape of the workout detail: badge, title, date, stats strip, two cards.
export function WorkoutDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5 p-3.5 md:p-4 lg:col-span-3">
      <Skeleton className="h-[22px] w-[60px] rounded-full" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-[62px] rounded-[18px]" />
      <Skeleton className="h-[150px] rounded-[20px]" />
      <Skeleton className="h-[150px] rounded-[20px]" />
    </div>
  );
}

export function WorkoutNotFound() {
  const t = useSessionsTranslation();
  return (
    <div className="mx-auto w-full max-w-2xl p-3.5 md:p-4 lg:col-span-3">
      <div className="bg-card flex flex-col items-center gap-4 rounded-[20px] border px-5 py-8 text-center">
        <p className="font-heading text-[20px] font-medium">{t.workoutDetail.notFound}</p>
        <Link
          to="/calendar"
          className="border-border-strong bg-card text-primary hover:bg-muted inline-flex h-11 items-center rounded-full border px-6 text-[14px] font-semibold transition-colors"
        >
          {t.workoutDetail.backToCalendar}
        </Link>
      </div>
    </div>
  );
}
