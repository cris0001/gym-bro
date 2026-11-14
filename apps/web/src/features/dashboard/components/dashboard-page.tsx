import { Link } from '@tanstack/react-router';
import { addDays, format } from 'date-fns';
import { Play } from 'lucide-react';

import { useBodyMeasurements } from '@/features/body';
import { useCurrentTarget, useDailyFoodLog } from '@/features/nutrition';
import { usePlannedSessions, useWorkoutSessions } from '@/features/sessions';
import { StravaSection } from '@/features/strava';
import { Button } from '@/components/ui/button';

import { useDashboardTranslation } from '../i18n';
import { DashboardSkeleton } from './dashboard-skeleton';
import { LastWorkoutCard } from './last-workout-card';
import { LatestWeightCard } from './latest-weight-card';
import { NextSessionCard } from './next-session-card';
import { TodayNutritionCard } from './today-nutrition-card';

// Recent-sessions window shared with LastWorkoutCard so both hit one cached query.
const RECENT_WINDOW = 10;

const ISO = 'yyyy-MM-dd';
// Window for finding the next planned session.
const LOOKAHEAD_DAYS = 60;

function greetingKey(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// Home screen: an editorial header + start CTA, the nutrition hero paired with the next
// planned session, weight + last-workout stats, and the Strava section. Composes the
// features' public hooks — no dashboard-specific backend.
export function DashboardPage() {
  const t = useDashboardTranslation();
  const today = new Date();
  const todayIso = format(today, ISO);

  const planned = usePlannedSessions(todayIso, format(addDays(today, LOOKAHEAD_DAYS), ISO));
  // The dashboard's other cards fetch these too; calling them here shares one cached
  // query each and lets the page show a single full-page skeleton on the first load.
  const nutrition = useDailyFoodLog(todayIso);
  const target = useCurrentTarget();
  const weight = useBodyMeasurements();
  const workouts = useWorkoutSessions(RECENT_WINDOW, 0);

  // Only the very first load (no cached data yet) shows the skeleton; a background
  // refetch keeps the current content on screen.
  const initialLoading =
    planned.isPending ||
    nutrition.isPending ||
    target.isPending ||
    weight.isPending ||
    workouts.isPending;

  const nextSession =
    (planned.data ?? [])
      .filter((entry) => entry.status === 'planned' && entry.scheduledDate >= todayIso)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0] ?? null;

  if (initialLoading) return <DashboardSkeleton />;

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-5 p-3 md:p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <p className="text-muted-foreground text-sm">{format(today, 'EEEE, MMMM d')}</p>
          <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight lg:text-[34px]">
            {t.greeting[greetingKey(today.getHours())]}
          </h1>
        </div>
        <Button asChild className="hidden h-9.5 rounded-full px-5 lg:inline-flex">
          <Link to="/session">
            <Play className="size-4" />
            {t.startWorkout}
          </Link>
        </Button>
      </header>

      {/* 38px tall like the other header actions; the ::after strip keeps a 44px+ tap area. */}
      <Button
        asChild
        className="relative h-9.5 w-full rounded-full text-sm font-semibold after:absolute after:inset-x-0 after:-inset-y-1 lg:hidden"
      >
        <Link to="/session">
          <Play className="size-4" />
          {t.startWorkout}
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TodayNutritionCard date={todayIso} />
        <NextSessionCard session={nextSession} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LatestWeightCard />
        <LastWorkoutCard />
      </div>

      <StravaSection />
    </div>
  );
}
