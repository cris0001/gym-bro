import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ChevronRight, Star } from 'lucide-react';

import { useWorkoutSession, useWorkoutSessions } from '@/features/sessions';

// A small window of recent sessions to find the latest strength one within (ad-hoc
// activities are skipped) — enough for the dashboard without paging.
const RECENT_WINDOW = 10;

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// The most recent strength workout, linking to its detail. Text-forward stat card:
// micro-label over the serif name + a muted meta line. Ad-hoc activity sessions are
// ignored (they belong to the Strava/activity view).
export function LastWorkoutCard() {
  const { data } = useWorkoutSessions(RECENT_WINDOW, 0);
  const last = data?.items.find((session) => session.sessionType === 'strength') ?? null;
  // Pull the exercise names performed (list items don't carry them); deferred until
  // there's a session to show.
  const { data: detail } = useWorkoutSession(last?.id ?? '', Boolean(last));
  const exercises = detail?.performances.map((performance) => performance.exercise.name) ?? [];

  if (!last) {
    return (
      <div className="bg-card flex flex-col gap-1 rounded-2xl border p-5">
        <p className={microLabel}>Last workout</p>
        <span className="text-muted-foreground text-sm">No workouts logged yet.</span>
        <Link to="/session" className="text-primary text-sm underline">
          Start one
        </Link>
      </div>
    );
  }

  const meta = [
    format(parseISO(last.performedDate), 'EEEE'),
    last.durationMinutes ? `${last.durationMinutes} min` : null,
    exercises.length > 0
      ? `${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      to="/history/$sessionId"
      params={{ sessionId: last.id }}
      className="bg-card flex flex-col gap-1 rounded-2xl border p-5"
    >
      <div className="flex items-center justify-between">
        <p className={microLabel}>Last workout</p>
        <ChevronRight className="text-muted-foreground size-5 shrink-0" />
      </div>
      <p className="font-heading truncate text-[22px] leading-tight font-semibold">{last.name}</p>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {meta}
        {last.rating ? (
          <span className="text-foreground inline-flex items-center gap-0.5">
            <Star className="size-3 fill-current" />
            {last.rating}
          </span>
        ) : null}
      </p>
      {exercises.length > 0 ? (
        <p className="text-muted-foreground line-clamp-1 text-xs">{exercises.join(', ')}</p>
      ) : null}
    </Link>
  );
}
