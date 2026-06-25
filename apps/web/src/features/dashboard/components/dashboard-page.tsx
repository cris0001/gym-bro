import { Link } from '@tanstack/react-router';
import { addDays, format } from 'date-fns';

import { usePlannedSessions, useWorkoutSessions } from '@/features/sessions';
import { Button } from '@/components/ui/button';

import { computeWeeklyStreak, countWorkoutsThisWeek } from '../utils/compute-weekly-streak';
import { NextSessionCard } from './next-session-card';
import { StreakCard } from './streak-card';

const ISO = 'yyyy-MM-dd';
// Window for finding the next planned session.
const LOOKAHEAD_DAYS = 60;
// Recent workouts are enough to compute the streak (≥2/week ≈ 50 weeks of cover).
const RECENT_LIMIT = 100;

// Home screen: weekly streak + next planned session, with a quick start action.
// Composes the sessions feature's public hooks — no dashboard-specific backend.
export function DashboardPage() {
  const today = new Date();
  const todayIso = format(today, ISO);

  const { data: history } = useWorkoutSessions(RECENT_LIMIT, 0);
  const { data: planned = [] } = usePlannedSessions(
    todayIso,
    format(addDays(today, LOOKAHEAD_DAYS), ISO),
  );

  const performedDates = (history?.items ?? []).map((session) => session.performedDate);
  const streak = computeWeeklyStreak(performedDates, today);
  const thisWeekCount = countWorkoutsThisWeek(performedDates, today);

  const nextSession =
    planned
      .filter((entry) => entry.status === 'planned' && entry.scheduledDate >= todayIso)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCard streak={streak} thisWeekCount={thisWeekCount} />
        <NextSessionCard session={nextSession} />
      </div>

      <Button asChild className="h-11">
        <Link to="/session">Start a workout</Link>
      </Button>
    </div>
  );
}
