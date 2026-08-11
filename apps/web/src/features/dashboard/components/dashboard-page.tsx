import { Link } from '@tanstack/react-router';
import { addDays, format } from 'date-fns';
import { Play, User } from 'lucide-react';

import { usePlannedSessions } from '@/features/sessions';
import { StravaSection } from '@/features/strava';
import { Button } from '@/components/ui/button';

import { LastWorkoutCard } from './last-workout-card';
import { LatestWeightCard } from './latest-weight-card';
import { NextSessionCard } from './next-session-card';
import { TodayNutritionCard } from './today-nutrition-card';

const ISO = 'yyyy-MM-dd';
// Window for finding the next planned session.
const LOOKAHEAD_DAYS = 60;

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Home screen: an editorial header + start CTA, the nutrition hero paired with the next
// planned session, weight + last-workout stats, and the Strava section. Composes the
// features' public hooks — no dashboard-specific backend.
export function DashboardPage() {
  const today = new Date();
  const todayIso = format(today, ISO);

  const { data: planned = [] } = usePlannedSessions(
    todayIso,
    format(addDays(today, LOOKAHEAD_DAYS), ISO),
  );

  const nextSession =
    planned
      .filter((entry) => entry.status === 'planned' && entry.scheduledDate >= todayIso)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0] ?? null;

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-5 p-3 md:p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <p className="font-heading text-muted-foreground text-sm italic">
            {format(today, 'EEEE, MMMM d')}
          </p>
          <h1 className="font-heading text-[28px] leading-tight font-medium lg:text-[34px]">
            {greetingFor(today.getHours())}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="hidden h-11 rounded-full px-5 lg:inline-flex">
            <Link to="/session">
              <Play className="size-4" />
              Start workout
            </Link>
          </Button>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#efe5d6] text-[#8a5a3b] dark:bg-[#3a2f22] dark:text-[#c99f74]">
            <User className="size-5" />
          </span>
        </div>
      </header>

      <Button asChild className="h-14 w-full rounded-full text-base lg:hidden">
        <Link to="/session">
          <Play className="size-5" />
          Start workout
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TodayNutritionCard date={todayIso} />
        <NextSessionCard session={nextSession} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LatestWeightCard />
        <LastWorkoutCard />
      </div>

      <StravaSection />
    </div>
  );
}
